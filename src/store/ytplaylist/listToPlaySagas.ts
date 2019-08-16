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

import * as listToPlayActions from "./listToPlayActions";
import {
  selectAllNormPlaylists,
  selectNormListToPlayEntities,
  selectNormListToPlayPlaylistItems,
  selectNormListToPlayResult,
  selectNormListToPlaySnippetIds,
  selectNormPlaylistById,
  selectNormPlaylistIdByItemId,
  selectNormPlaylistsResult,
  selectNormSnippetIdByItemId,
} from "./normSelector";
import * as playlistActions from "./playlistActions";
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
  yield put(listToPlayActions.addUniqueNormListToPlay(newEntities, newResult));
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
      yield put(playlistActions.removeAllInPlayingLabelByIdAction(playlistId));
      return;
    }
  }

  yield put(playlistActions.addAllInPlayingLabelByIdAction(playlistId));
  return;
}
// ===============================================
// End helpers
// ===============================================

export function* addNormListToPlayWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_LIST_TO_PLAY, function*(
    action: ActionType<typeof listToPlayActions.addNormListToPlayAction>
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
    action: ActionType<typeof listToPlayActions.addNormListToPlayItemAction>
  ) {
    const item = action.payload;
    yield call(uniquelyAddListToPlayItems, [item]);
  });
}

export function* addNormListToPlayItemsWatcher() {
  yield takeEvery(ActionTypes.ADD_NORM_LIST_TO_PLAY_ITEMS, function*(
    action: ActionType<typeof listToPlayActions.addNormListToPlayItemsAction>
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
      yield put(playlistActions.removeAllInPlayingLabelByIdAction(playlistId));
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
      | typeof listToPlayActions.addUniqueNormListToPlay
      | typeof listToPlayActions.deleteNormListToPlayItemByIdAction
      | typeof listToPlayActions.deleteNormListToPlayItemsAction
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

export default function* listToPlaySagas() {
  yield all([
    addNormListToPlayWatcher(),
    addNormListToPlayItemWatcher(),
    addNormListToPlayItemsWatcher(),
    clearListToPlayWatcher(),
    checkIfAllPlaylistItemsInPlaying(),
  ]);
}