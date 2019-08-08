import { createAction } from "typesafe-actions";
import * as ActionTypes from "utils/constants/actionConstants";

import {
  NormListToPlayEntities,
  NormListToPlayResultItem,
  NormPlaylistsEntities,
  NormVideosEntities,
} from "./types";

// ===============================================
// Playlist
// ===============================================
/**
 * Add normalized fetched playlist data to redux store
 *
 * @param entities Normalized states entities of playlists
 * @param result Normalized states result of playlists
 * @returns ADD_FETCHED_PLAYLIST action object
 */
export const addNormPlaylistAction = createAction(
  ActionTypes.ADD_NORM_PLAYLIST,
  (action) => {
    return (entities: NormPlaylistsEntities, result: string[]) =>
      action({
        entities,
        result,
      });
  }
);

/**
 * Add all items in the specified normalized playlist into normalized listToPlay
 *
 * **_Note: This action is handled through saga. No reducer logic involved_**
 *
 * @param playlistId Playlist id
 * @param itemIds Playlist's itemIds to add
 * @returns ADD_NORM_PLAYLIST_TO_NORM_LIST_TO_PLAY action object
 */
export const addNormPlaylistToNormListToPlayAction = createAction(
  ActionTypes.ADD_NORM_PLAYLIST_TO_NORM_LIST_TO_PLAY,
  (action) => {
    return (playlistId: string, itemIds: string[]) =>
      action({
        playlistId,
        itemIds,
      });
  }
);

/**
 * Remove all items in the specified normalized playlist from normalized listToPlay
 *
 * **_Note: This action is handled through saga. No reducer logic involved_**
 *
 * @param playlistId Playlist id
 * @param itemIds Playlist's itemIds to add
 *
 */
export const removeNormPlaylistFromNormListToPlayAction = createAction(
  ActionTypes.REMOVE_NORM_PLAYLIST_FROM_NORM_LIST_TO_PLAY,
  (action) => {
    return (playlistId: string, itemIds: string[]) =>
      action({
        playlistId,
        itemIds,
      });
  }
);

/**
 * Delete playlist by id
 *
 * @param id Playlist id to delete
 * @returns DELETE_PLAYLIST_BY_ID action object
 */
export const deleteNormPlaylistByIdAction = createAction(
  ActionTypes.DELETE_NORM_PLAYLIST_BY_ID,
  (action) => {
    return (id: string) =>
      action({
        id,
      });
  }
);

/**
 * Delete playlist's item and snippet by specifying itemId with the id of
 * the belonging playlist
 *
 * @param {string} playlistId Playlist id in which the playlistItem is located
 * @param {string} itemId PlaylistItem id to delete
 */
export const deleteNormPlaylistItemByIdAction = createAction(
  ActionTypes.DELETE_NORM_PLAYLIST_ITEM_BY_ID,
  (action) => {
    return (playlistId: string, itemId: string) =>
      action({
        playlistId,
        itemId,
      });
  }
);

/**
 * Update playlist name by id
 *
 * @param id Playlist id
 * @param name New name for playlist
 * @returns UPDATE_PLAYLIST_NAME_BY_ID action object
 */
export const updateNormPlaylistNameByIdAction = createAction(
  ActionTypes.UPDATE_NORM_PLAYLIST_NAME_BY_ID,
  (action) => {
    return (id: string, name: string) =>
      action({
        id,
        name,
      });
  }
);

/**
 * Add allInPlaying label to the playlist in normalized listToPlay (if all of
 * its items are in normalized listToPlay)
 *
 * @param id Playlist id to add allInPlaying label
 */
export const addAllInPlayingLabelByIdAction = createAction(
  ActionTypes.ADD_ALL_IN_PLAYING_LABEL_BY_ID,
  (action) => (id: string) => action({ id })
);

/**
 * Remove allInPlaying label of playlist, after removing it from normalized listToPlay
 * @param id Playlist id to remove allInPlaying label
 */
export const removeAllInPlayingLabelByIdAction = createAction(
  ActionTypes.REMOVE_ALL_IN_PLAYING_LABEL_BY_ID,
  (action) => (id: string) => action({ id })
);

/**
 * Shuffle norm playlist items by playlist id
 * @param id Playlist id to shuffle
 */
export const shuffleNormPlaylistItems = createAction(
  ActionTypes.SHUFFLE_NORM_PLAYLIST_ITEMS,
  (action) => (id: string) => action({ id })
);

// ===============================================
// videos
// ===============================================
/**
 * Add fetched video data from API to redux store
 *
 * @param entities Normalized videos entities from videos states
 * @param result Normalized videos result from videos states
 * @returns ADD_FETCHED_VIDEO action object
 */
export const addNormVideoAction = createAction(
  ActionTypes.ADD_NORM_VIDEO,
  (action) => {
    return (entities: NormVideosEntities, result: string[]) =>
      action({
        entities,
        result,
      });
  }
);

/**
 * Update video name by id
 *
 * @param id Video id to rename
 * @param name New name for the specified video
 * @returns UPDATE_VIDEO_NAME_BY_ID action object
 */
export const updateNormVideoNameByIdAction = createAction(
  ActionTypes.UPDATE_NORM_VIDEO_NAME_BY_ID,
  (action) => {
    return (id: string, name: string) =>
      action({
        id,
        name,
      });
  }
);

/**
 * Delete per video from store by id
 *
 * @param id Video id to delete
 * @returns DELETE_VIDEO_BY_ID action object
 */
export const deleteNormVideoByIdAction = createAction(
  ActionTypes.DELETE_NORM_VIDEO_BY_ID,
  (action) => {
    return (id: string) =>
      action({
        id,
      });
  }
);

// ===============================================
// List To Play
// ===============================================
/**
 * Add normalized listToPlay entities to store
 *
 * @param entities Normalized entities of listToPlay
 * @param result Normalized result of listToPlay
 * @returns ADD_NORM_LIST_TO_PLAY action object
 */
export const addNormListToPlayAction = createAction(
  ActionTypes.ADD_NORM_LIST_TO_PLAY,
  (action) => {
    return (
      entities: NormListToPlayEntities,
      result: NormListToPlayResultItem[]
    ) =>
      action({
        entities,
        result,
      });
  }
);

/**
 * Add per item to listToPlay
 *
 * @param resultItem List item with item's id and its schema
 * @param foreignKey Id of playlist/video that owns this item
 * @returns ADD_LIST_TO_PLAY_ITEM action object
 */
export const addNormListToPlayItemAction = createAction(
  ActionTypes.ADD_NORM_LIST_TO_PLAY_ITEM,
  (action) => {
    return (resultItem: NormListToPlayResultItem, foreignKey: string) =>
      action({
        resultItem,
        foreignKey,
      });
  }
);

/**
 * Add items as a batch to normalized listToPlay
 *
 * @param items Item array consists of normalized listToPlay's result item and
 * foreign key
 * @returns ADD_NORM_LIST_TO_PLAY_ITEMS action object
 *
 */
export const addNormListToPlayItemsAction = createAction(
  ActionTypes.ADD_NORM_LIST_TO_PLAY_ITEMS,
  (action) => {
    return (
      items: {
        resultItem: NormListToPlayResultItem;
        foreignKey: string;
      }[]
    ) =>
      action({
        items,
      });
  }
);

/**
 * Update entire normalized listToPlay with full replacement to previous state
 *
 * @param source Source type (playlists/videos)
 * @param sourceId Id of the playlist/video source
 * @param itemIds An array of source item ids
 * @returns UPDATE_NORM_LIST_TO_PLAY action object
 */
export const updateNormListToPlayAction = createAction(
  ActionTypes.UPDATE_NORM_LIST_TO_PLAY,
  (action) => {
    return (source: MediaSourceType, sourceId: string, itemIds: string[]) =>
      action({ source, sourceId, itemIds });
  }
);

/**
 * Delete per listToPlay item by itemId
 *
 * @param id Item id to be deleted
 * @returns DELETE_LIST_TO_PLAY_ITEM_BY_ID action object
 */
export const deleteNormListToPlayItemByIdAction = createAction(
  ActionTypes.DELETE_NORM_LIST_TO_PLAY_ITEM_BY_ID,
  (action) => {
    return (id: string) =>
      action({
        id,
      });
  }
);

/**
 * Delete listToPlay items by itemIds
 *
 * @param ids Item ids array to be deleted
 * @returns DELETE_LIST_TO_PLAY_ITEMS action object
 */
export const deleteNormListToPlayItemsAction = createAction(
  ActionTypes.DELETE_NORM_LIST_TO_PLAY_ITEMS,
  (action) => {
    return (ids: string[]) =>
      action({
        ids,
      });
  }
);
