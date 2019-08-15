import cloneDeep from "lodash/cloneDeep";
import map from "lodash/map";
import uniq from "lodash/uniq";
import {
  all,
  call,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import { AppState } from "store";
import { ActionType } from "typesafe-actions";
import * as ActionTypes from "utils/constants/actionConstants";

import {
  addAllInPlayingLabelByIdAction,
  addNormListToPlayAction,
  addNormListToPlayItemAction,
  addNormListToPlayItemsAction,
  addNormPlaylistToNormListToPlayAction,
  addNormVideosToNormListToPlayAction,
  addNormVideoToNormListToPlayAction,
  addUniqueNormListToPlay,
  deleteNormListToPlayItemByIdAction,
  deleteNormListToPlayItemsAction,
  deleteNormPlaylistAndListToPlayItemsAction,
  deleteNormPlaylistByIdAction,
  deleteNormPlaylistItemByIdAction,
  deleteNormPlaylistsAndListToPlayItemsAction,
  deleteNormVideoByIdAction,
  removeAllInPlayingLabelByIdAction,
  removeNormPlaylistFromNormListToPlayAction,
  removeNormPlaylistsFromNormListToPlayAction,
  removeNormVideoFromNormListToPlayAction,
  removeNormVideosFromNormListToPlayAction,
} from "./normAction";
import {
  selectAllNormPlaylists,
  selectNormListToPlayEntities,
  selectNormListToPlayPlaylistItems,
  selectNormListToPlayResult,
  selectNormListToPlaySnippetIds,
  selectNormPlaylistById,
  selectNormPlaylistIdByItemId,
  selectNormPlaylistItemIdsByPlaylistId,
  selectNormPlaylistsResult,
  selectNormSnippetIdByItemId,
} from "./normSelector";
import {
  NormListToPlayEntities,
  NormListToPlayPlaylistItemsEntity,
  NormListToPlayResultItem,
  NormPlaylistsSourceEntity,
} from "./types";

// ===============================================
// Helpers
// ===============================================
/**
 * Compare and check each item in items array, add to normalized listToPlay if
 * the item is unique with regards to snippetId (not itemId).
 *
 * @param items New listToPlay items to be added
 *
 */
function* uniquelyAddListToPlayItems(
  items: {
    resultItem: NormListToPlayResultItem;
    foreignKey: string;
  }[]
) {
  const prevEntities: NormListToPlayEntities = yield select(
    selectNormListToPlayEntities
  );
  const prevResult: NormListToPlayResultItem[] = yield select(
    selectNormListToPlayResult
  );
  const snippetIds: string[] = yield select(selectNormListToPlaySnippetIds);

  // clone entities and result to preserve immutability of redux states
  const newEntities = cloneDeep(prevEntities);
  const newResult = [...prevResult];

  for (const item of items) {
    const {
      resultItem: { id: itemId, schema },
      foreignKey,
    } = item;
    const currentSnippetId = yield select((state: AppState) =>
      selectNormSnippetIdByItemId(state, itemId)
    );

    // check if snippetId of current item existed previously
    // if no, add it to newEntities and newResult
    if (!snippetIds.includes(currentSnippetId)) {
      newEntities[schema][itemId] = { id: itemId, foreignKey };
      newResult.push({
        id: itemId,
        schema,
      });
    }
  }

  // merge new entities and result to normalized listToPlay
  yield put(addUniqueNormListToPlay(newEntities, newResult));
}

/**
 * A helper function to add or remove allInPlaying label from certain playlist
 * based on the condition of latest normalized listToPlay items
 *
 * @param playlistId Playlist id to check
 *
 */
export function* addOrRemoveAllInPlaying(playlistId: string) {
  const playlist: ReturnType<typeof selectNormPlaylistById> = yield select(
    (state: AppState) => selectNormPlaylistById(state, playlistId)
  );
  const listToPlayPlaylistItems: NormListToPlayPlaylistItemsEntity = yield select(
    selectNormListToPlayPlaylistItems
  );

  for (const itemId of playlist.items) {
    if (!listToPlayPlaylistItems[itemId]) {
      yield put(removeAllInPlayingLabelByIdAction(playlistId));
      return;
    }
  }

  yield put(addAllInPlayingLabelByIdAction(playlistId));
  return;
}
// ===============================================
// End helpers
// ===============================================

/**
 * Saga which watching for DELETE_NORM_VIDEO_BY_ID action.
 * If triggered, it dispatch an action to delete the respective video item from
 * normListToPlay (if exists) as well
 *
 */
export function* deleteNormVideoByIdWatcher() {
  yield takeEvery(ActionTypes.DELETE_NORM_VIDEO_BY_ID, function*(
    action: ActionType<typeof deleteNormVideoByIdAction>
  ) {
    const {
      payload: { id },
    } = action;

    // remove item from normalized listToPlay videoItems
    yield put(deleteNormListToPlayItemByIdAction(id));
  });
}

/**
 * Saga which watching for DELETE_NORM_PLAYLIST_AND_LIST_TO_PLAY_ITEMS action.
 * If triggered, it removes **ONE** playlist from normalized playlist,
 * and also its corresponding items in normalized listToPlay as well if found
 *
 */
export function* deleteNormPlaylistAndListToPlayItemsWatcher() {
  yield takeEvery(
    ActionTypes.DELETE_NORM_PLAYLIST_AND_LIST_TO_PLAY_ITEMS,
    function*(
      action: ActionType<typeof deleteNormPlaylistAndListToPlayItemsAction>
    ) {
      const {
        payload: { playlistId },
      } = action;

      const itemIds = yield select((state: AppState) =>
        selectNormPlaylistItemIdsByPlaylistId(state, playlistId)
      );

      // delete normalized playlist items from normalized listToPlay
      // then delete the playlist from normalized playlists
      yield put(deleteNormListToPlayItemsAction(itemIds));
      yield put(deleteNormPlaylistByIdAction(playlistId));
    }
  );
}

/**
 * Saga which watching for DELETE_NORM_PLAYLISTS_AND_LIST_TO_PLAY_ITEMS action.
 *
 * It does the same exact same thing as deleteNormPlaylistsAndListToPlayItemsWatcher,
 * but to **multiple playlists**, by dispatching multiple
 * DELETE_NORM_PLAYLISTS_AND_LIST_TO_PLAY_ITEMS actions
 *
 */
export function* deleteNormPlaylistsAndListToPlayItemsWatcher() {
  while (true) {
    const {
      payload: { playlistIds },
    }: ActionType<
      typeof deleteNormPlaylistsAndListToPlayItemsAction
    > = yield take(ActionTypes.DELETE_NORM_PLAYLISTS_AND_LIST_TO_PLAY_ITEMS);

    for (const playlistId of playlistIds) {
      yield put(deleteNormPlaylistAndListToPlayItemsAction(playlistId));
    }
  }
}

/**
 * Saga which watching for DELETE_NORM_PLAYLIST_ITEM_BY_ID action.
 * If triggered, it dispatch an action to delete the respective playlist item from
 * normListToPlay (if exists) as well
 *
 */
export function* deleteNormPlaylistItemByIdWatcher() {
  yield takeEvery(ActionTypes.DELETE_NORM_PLAYLIST_ITEM_BY_ID, function*(
    action: ActionType<typeof deleteNormPlaylistItemByIdAction>
  ) {
    const {
      payload: { itemId },
    } = action;

    // remove item from normalized listToPlay as well after the playlist item was deleted
    yield put(deleteNormListToPlayItemByIdAction(itemId));
  });
}

/**
 * Saga that watching for ADD_NORM_PLAYLIST_TO_NORM_LIST_TO_PLAY action.
 * If triggered, it dispatch an action to add allInPlaying label to playlist,
 * and dispatch an action to add playlist items
 * to normalized listToPlay
 *
 */
export function* addNormPlaylistToNormListToPlayWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_PLAYLIST_TO_NORM_LIST_TO_PLAY, function*(
    action: ActionType<typeof addNormPlaylistToNormListToPlayAction>
  ) {
    const {
      payload: { playlistId },
    } = action;

    const itemIds: string[] = yield select((state: AppState) =>
      selectNormPlaylistItemIdsByPlaylistId(state, playlistId)
    );

    // add allInPlaying label to this playlist
    yield put(addAllInPlayingLabelByIdAction(playlistId));

    const playlistItems = itemIds.map((itemId) => ({
      resultItem: {
        id: itemId,
        schema: "playlistItems" as SchemaType,
      },
      foreignKey: playlistId,
    }));

    // add all items in the playlist into normListToPlay
    yield put(addNormListToPlayItemsAction(playlistItems));
  });
}

/**
 * Saga that watching for REMOVE_NORM_PLAYLIST_FROM_NORM_LIST_TO_PLAY action.
 * If triggered, it dispatch an action to remove allInPlaying label from playlist,
 * and dispatch an action to remove playlist items
 * from normalized listToPlay
 *
 */
export function* removeNormPlaylistFromNormListToPlayWatcher() {
  yield takeEvery(
    ActionTypes.REMOVE_NORM_PLAYLIST_FROM_NORM_LIST_TO_PLAY,
    function*(
      action: ActionType<typeof removeNormPlaylistFromNormListToPlayAction>
    ) {
      const {
        payload: { playlistId, itemIds },
      } = action;

      // remove allInPlaying label
      yield put(removeAllInPlayingLabelByIdAction(playlistId));

      // remove all items from normListToPlay
      yield put(deleteNormListToPlayItemsAction(itemIds));
    }
  );
}

/**
 * Saga which watching for REMOVE_NORM_PLAYLISTS_FROM_NORM_LIST_TO_PLAY action.
 *
 * If triggered, it dispatches multiple REMOVE_NORM_PLAYLIST_FROM_NORM_LIST_TO_PLAY actions
 * according to how many playlistIds.
 *
 */
export function* removeNormPlaylistsFromNormListToPlayWatcher() {
  while (true) {
    const {
      payload: { playlistIds },
    }: ActionType<
      typeof removeNormPlaylistsFromNormListToPlayAction
    > = yield take(ActionTypes.REMOVE_NORM_PLAYLISTS_FROM_NORM_LIST_TO_PLAY);

    for (const playlistId of playlistIds) {
      const itemIds: string[] = yield select((state: AppState) =>
        selectNormPlaylistItemIdsByPlaylistId(state, playlistId)
      );

      yield put(
        removeNormPlaylistFromNormListToPlayAction(playlistId, itemIds)
      );
    }
  }
}

/**
 * Saga that watching for ADD_NORM_VIDEO_TO_NORM_LIST_TO_PLAY action.
 * If triggered, it dispatches an action to add video item
 * to normalized listToPlay
 *
 */
export function* addNormVideoToNormListToPlayWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_VIDEO_TO_NORM_LIST_TO_PLAY, function*(
    action: ActionType<typeof addNormVideoToNormListToPlayAction>
  ) {
    const {
      payload: { videoId },
    } = action;

    const listToPlayVideoItem = {
      resultItem: {
        id: videoId,
        schema: "videoItems" as SchemaType,
      },
      foreignKey: videoId,
    };

    yield put(
      addNormListToPlayItemAction(
        listToPlayVideoItem.resultItem,
        listToPlayVideoItem.foreignKey
      )
    );
  });
}

/**
 * Saga that watching for ADD_NORM_VIDEOS_TO_NORM_LIST_TO_PLAY action.
 * If triggered, it dispatches multiple ADD_NORM_VIDEO_TO_NORM_LIST_TO_PLAY actions
 * to add all item with the videoId as specified in videoIds array
 *
 */
export function* addNormVideosToNormListToPlayWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_VIDEOS_TO_NORM_LIST_TO_PLAY, function*(
    action: ActionType<typeof addNormVideosToNormListToPlayAction>
  ) {
    const {
      payload: { videoIds },
    } = action;

    for (const videoId of videoIds) {
      yield put(addNormVideoToNormListToPlayAction(videoId));
    }
  });
}

/**
 * Saga that watching for REMOVE_NORM_VIDEO_FROM_NORM_LIST_TO_PLAY action.
 * If triggered, it dispatches an action to remove playlist item from normalized listToPlay
 *
 */
export function* removeNormVideoFromNormListToPlayWatcher() {
  yield takeEvery(
    ActionTypes.REMOVE_NORM_VIDEO_FROM_NORM_LIST_TO_PLAY,
    function*(
      action: ActionType<typeof removeNormVideoFromNormListToPlayAction>
    ) {
      const {
        payload: { videoId: itemId },
      } = action;

      yield put(deleteNormListToPlayItemByIdAction(itemId));
    }
  );
}

/**
 * Saga that watching for REMOVE_NORM_VIDEOS_FROM_NORM_LIST_TO_PLAY action.
 * If triggered, it dispatches DELETE_NORM_LIST_TO_PLAY_ITEMS action
 * to remove video items from normalized listToPlay
 *
 */
export function* removeNormVideosFromNormListToPlayWatcher() {
  yield takeEvery(
    ActionTypes.REMOVE_NORM_VIDEOS_FROM_NORM_LIST_TO_PLAY,
    function*(
      action: ActionType<typeof removeNormVideosFromNormListToPlayAction>
    ) {
      const {
        payload: { videoIds: itemIds },
      } = action;

      yield put(deleteNormListToPlayItemsAction(itemIds));
    }
  );
}

export function* addNormListToPlayWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_LIST_TO_PLAY, function*(
    action: ActionType<typeof addNormListToPlayAction>
  ) {
    const {
      payload: { entities, result },
    } = action;

    const items = result.map(({ id, schema }) => ({
      resultItem: { id, schema },
      foreignKey: entities[schema][id].foreignKey,
    }));

    yield call(uniquelyAddListToPlayItems, items);
  });
}

export function* addNormListToPlayItemWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_LIST_TO_PLAY_ITEM, function*(
    action: ActionType<typeof addNormListToPlayItemAction>
  ) {
    const item = action.payload;
    yield call(uniquelyAddListToPlayItems, [item]);
  });
}

export function* addNormListToPlayItemsWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_LIST_TO_PLAY_ITEMS, function*(
    action: ActionType<typeof addNormListToPlayItemsAction>
  ) {
    const { items } = action.payload;
    yield call(uniquelyAddListToPlayItems, items);
  });
}

/**
 * Saga which watching for CLEAR_LIST_TO_PLAY for normalized listToPlay.
 * If triggered, it dispatches action to remove allInPlaying for playlists which
 * include all its items in normalized listToPlay
 *
 */
export function* clearListToPlayWatcher() {
  yield takeLatest(ActionTypes.CLEAR_LIST_TO_PLAY, function*() {
    const playlistIds: string[] = yield select(selectNormPlaylistsResult);

    // remove allInPlaying label if found
    for (const playlistId of playlistIds) {
      yield put(removeAllInPlayingLabelByIdAction(playlistId));
    }
  });
}

/**
 * A special saga that watches for multiple actions that involving
 * add/delete normalized listToPlay items.
 * If the item(s) deleted is/are from playlist,
 * then the allInPlaying label will be added or removed
 * based on situation
 *
 */
export function* checkIfAllPlaylistItemsInPlaying() {
  while (true) {
    const action: ActionType<
      | typeof addUniqueNormListToPlay
      | typeof deleteNormListToPlayItemByIdAction
      | typeof deleteNormListToPlayItemsAction
    > = yield take([
      ActionTypes.ADD_UNIQUE_NORM_LIST_TO_PLAY,
      ActionTypes.DELETE_NORM_LIST_TO_PLAY_ITEM_BY_ID,
      ActionTypes.DELETE_NORM_LIST_TO_PLAY_ITEMS,
    ]);
    let playlistId: string | undefined;
    let playlistIds: string[] | undefined;

    switch (action.type) {
      case "ADD_UNIQUE_NORM_LIST_TO_PLAY": {
        const {
          entities: { playlistItems },
        } = action.payload;

        playlistIds = uniq(map(playlistItems, (item) => item.foreignKey));

        break;
      }

      case "DELETE_NORM_LIST_TO_PLAY_ITEM_BY_ID": {
        const { id: itemId } = action.payload;

        // playlistId is undefined if the itemId is belonged to video
        playlistId = yield select((state) =>
          selectNormPlaylistIdByItemId(state, itemId)
        );

        break;
      }

      // check if deleted itemIds are part of playlist's items
      // if so then add it to playlistIds array waiting to be removed
      case "DELETE_NORM_LIST_TO_PLAY_ITEMS": {
        const { ids: itemIds } = action.payload;
        const playlists: NormPlaylistsSourceEntity = yield select(
          selectAllNormPlaylists
        );
        playlistIds = [];

        for (const [playlistId, playlist] of Object.entries(playlists)) {
          const playlistContainsDeletedItem = playlist.items.some(
            (playlistItemId) => itemIds.includes(playlistItemId)
          );

          if (playlistContainsDeletedItem) {
            playlistIds.push(playlistId);
          }
        }

        break;
      }

      default: {
        playlistId = undefined;
        playlistIds = undefined;
      }
    }

    if (playlistId) {
      yield fork(addOrRemoveAllInPlaying, playlistId);
    }

    if (playlistIds && playlistIds.length !== 0) {
      for (const playlistId of playlistIds) {
        yield fork(addOrRemoveAllInPlaying, playlistId);
      }
    }
  }
}

export default function* ytplaylistNormedSaga() {
  yield all([
    deleteNormVideoByIdWatcher(),
    deleteNormPlaylistAndListToPlayItemsWatcher(),
    deleteNormPlaylistsAndListToPlayItemsWatcher(),
    deleteNormPlaylistItemByIdWatcher(),
    addNormPlaylistToNormListToPlayWatcher(),
    removeNormPlaylistFromNormListToPlayWatcher(),
    removeNormPlaylistsFromNormListToPlayWatcher(),
    addNormVideoToNormListToPlayWatcher(),
    addNormVideosToNormListToPlayWatcher(),
    removeNormVideoFromNormListToPlayWatcher(),
    removeNormVideosFromNormListToPlayWatcher(),
    addNormListToPlayWatcher(),
    addNormListToPlayItemWatcher(),
    addNormListToPlayItemsWatcher(),
    clearListToPlayWatcher(),
    checkIfAllPlaylistItemsInPlaying(),
  ]);
}
