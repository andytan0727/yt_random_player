import { createAction } from "typesafe-actions";
import {
  ADD_ALL_IN_PLAYING_LABEL_BY_ID,
  ADD_PARTIAL_IN_PLAYING_LABEL_BY_ID,
  ADD_PLAYLIST,
  ADD_PLAYLIST_TO_LIST_TO_PLAY,
  DELETE_PLAYLIST_BY_ID,
  DELETE_PLAYLIST_ITEM_BY_ID,
  DELETE_PLAYLIST_ITEMS_BY_ID,
  REMOVE_ALL_IN_PLAYING_LABEL_BY_ID,
  REMOVE_PARTIAL_IN_PLAYING_LABEL_BY_ID,
  REMOVE_PLAYLIST_FROM_LIST_TO_PLAY,
  REMOVE_PLAYLISTS_FROM_LIST_TO_PLAY,
  REORDER_PLAYLIST_ITEM_BY_PLAYLIST_ID,
  SHUFFLE_PLAYLIST_ITEMS,
  SYNC_PLAYLIST_FROM_YT_BY_ID,
  SYNC_PLAYLIST_FROM_YT_BY_ID_FAILED,
  SYNC_PLAYLIST_FROM_YT_BY_ID_SUCCESS,
  UPDATE_PLAYLIST_NAME_BY_ID,
} from "utils/constants/actionConstants";

import { PlaylistsEntities } from "./types";

/**
 * Add fetched playlist data to redux store
 *
 * @param entities Normalized states entities of playlists
 * @param result Normalized states result of playlists
 * @returns ADD_FETCHED_PLAYLIST action object
 */
export const addPlaylistAction = createAction(
  ADD_PLAYLIST,
  (entities: PlaylistsEntities, result: string[]) => ({
    entities,
    result,
  })
)();

/**
 * Add all items in the specified playlist into listToPlay
 *
 * **_Note: This action is handled through saga. No reducer logic involved_**
 *
 * @param playlistId Playlist id
 * @returns ADD_PLAYLIST_TO_LIST_TO_PLAY action object
 */
export const addPlaylistToListToPlayAction = createAction(
  ADD_PLAYLIST_TO_LIST_TO_PLAY,
  (playlistId: string) => ({
    playlistId,
  })
)();

/**
 * Remove all items in the specified playlist from listToPlay
 *
 * **_Note: This action is handled through saga. No reducer logic involved_**
 *
 * @param playlistId Playlist id
 *
 */
export const removePlaylistFromListToPlayAction = createAction(
  REMOVE_PLAYLIST_FROM_LIST_TO_PLAY,
  (playlistId: string) => ({
    playlistId,
  })
)();

/**
 * Remove all items associating with each playlistId in playlistIds array from listToPlay
 *
 * **_Note: This action is handled through saga. No reducer logic involved_**
 *
 * @param playlistIds An array consisting more than 1 playlistId
 * @returns REMOVE_PLAYLISTS_FROM_LIST_TO_PLAY action object
 *
 */
export const removePlaylistsFromListToPlayAction = createAction(
  REMOVE_PLAYLISTS_FROM_LIST_TO_PLAY,
  (playlistIds: string[]) => ({
    playlistIds,
  })
)();

/**
 * Delete playlist by id
 *
 * @param id Playlist id to delete
 * @returns DELETE_PLAYLIST_BY_ID action object
 */
export const deletePlaylistByIdAction = createAction(
  DELETE_PLAYLIST_BY_ID,
  (id: string) => ({
    id,
  })
)();

/**
 * Delete playlist's item and snippet by specifying itemId with the id of
 * the belonging playlist
 *
 * @param playlistId Playlist id in which the playlistItem is located
 * @param itemId PlaylistItem id to delete
 * @returns DELETE_PLAYLIST_ITEM_BY_ID action object
 */
export const deletePlaylistItemByIdAction = createAction(
  DELETE_PLAYLIST_ITEM_BY_ID,
  (playlistId: string, itemId: string) => ({
    playlistId,
    itemId,
  })
)();

/**
 * Batch deletion version of deletePlaylistItemByIdAction
 *
 * @param playlistId Playlist id in which the playlistItem is located
 * @param itemIds PlaylistItem ids array to delete
 * @returns DELETE_PLAYLIST_ITEMS_BY_ID action object
 */
export const deletePlaylistItemsByIdAction = createAction(
  DELETE_PLAYLIST_ITEMS_BY_ID,
  (playlistId: string, itemIds: string[]) => ({
    playlistId,
    itemIds,
  })
)();

/**
 * Synchronize whole playlist with YouTube by fetching
 * new data from YouTube playlist.
 * New and old playlist will be deeply merged with lodash merge
 *
 * **_Note: This action is handled through saga. No reducer logic involved_**
 *
 * @param playlistId Playlist Id to sync with
 * @returns SYNC_PLAYLIST_FROM_YT_BY_ID action object
 */
export const syncPlaylistFromYTByIdAction = createAction(
  SYNC_PLAYLIST_FROM_YT_BY_ID,
  (playlistId: string) => ({ playlistId })
)();

/**
 * Action to dispatch when synchronization is successful
 *
 * @param playlistId Playlist id which sync is successful
 * @returns SYNC_PLAYLIST_FROM_YT_BY_ID_SUCCESS action object
 */
export const syncPlaylistFromYTByIdSuccessAction = createAction(
  SYNC_PLAYLIST_FROM_YT_BY_ID_SUCCESS,
  (playlistId: string) => ({ playlistId })
)();

/**
 * Action to dispatch when synchronization is failed
 *
 * @returns SYNC_PLAYLIST_FROM_YT_BY_ID_FAILED action object
 */
export const syncPlaylistFromYTByIdFailedAction = createAction(
  SYNC_PLAYLIST_FROM_YT_BY_ID_FAILED
)();

/**
 * Update playlist name by id
 *
 * @param id Playlist id
 * @param name New name for playlist
 * @returns UPDATE_PLAYLIST_NAME_BY_ID action object
 */
export const updatePlaylistNameByIdAction = createAction(
  UPDATE_PLAYLIST_NAME_BY_ID,
  (id: string, name: string) => ({
    id,
    name,
  })
)();

/**
 * Add allInPlaying label to the playlist in listToPlay (if all of
 * its items are in listToPlay)
 *
 * @param id Playlist id to add allInPlaying label
 */
export const addAllInPlayingLabelByIdAction = createAction(
  ADD_ALL_IN_PLAYING_LABEL_BY_ID,
  (id: string) => ({ id })
)();

/**
 * Remove allInPlaying label of playlist, after removing it from listToPlay
 * @param id Playlist id to remove allInPlaying label
 */
export const removeAllInPlayingLabelByIdAction = createAction(
  REMOVE_ALL_IN_PLAYING_LABEL_BY_ID,
  (id: string) => ({ id })
)();

/**
 * Add partialInPlaying label to particular playlist
 * if some of its items are in listToPlay
 *
 * @param id Playlist id to add partialInPlaying label
 */
export const addPartialInPlayingLabelByIdAction = createAction(
  ADD_PARTIAL_IN_PLAYING_LABEL_BY_ID,
  (id: string) => ({ id })
)();

/**
 * Remove partialInPlaying label of particular playlist
 * @param id Playlist id to remove partialInPlaying label
 */
export const removePartialInPlayingLabelByIdAction = createAction(
  REMOVE_PARTIAL_IN_PLAYING_LABEL_BY_ID,
  (id: string) => ({ id })
)();

/**
 * Shuffle playlist items by playlist id
 * @param id Playlist id to shuffle
 */
export const shufflePlaylistItems = createAction(
  SHUFFLE_PLAYLIST_ITEMS,
  (id: string) => ({ id })
)();

/**
 * Reorder the position of playlist item, from fromIdx to toIdx by playlistId
 *
 * @param playlistId Playlist id
 * @param fromIdx Source index
 * @param toIdx Destination index
 * @returns REORDER_PLAYLIST_ITEM_BY_PLAYLIST_ID action object
 *
 */
export const reorderPlaylistItemByPlaylistIdAction = createAction(
  REORDER_PLAYLIST_ITEM_BY_PLAYLIST_ID,
  (playlistId: string, fromIdx: number, toIdx: number) => ({
    playlistId,
    fromIdx,
    toIdx,
  })
)();
