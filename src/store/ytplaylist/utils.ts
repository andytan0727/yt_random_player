import at from "lodash/at";
import has from "lodash/has";
import merge from "lodash/merge";
import pull from "lodash/pull";
import remove from "lodash/remove";
import set from "lodash/set";
import some from "lodash/some";
import uniq from "lodash/uniq";

import {
  ListToPlay,
  ListToPlayEntities,
  ListToPlayResultItem,
  MediaItem,
  PlaylistItemsEntity,
  PlaylistItemSnippet,
  PlaylistsEntities,
  PlaylistsOrVideos,
  PlaylistsOrVideosEntities,
  VideoItemSnippet,
} from "./types";

// =======================================
// Type Guards
// =======================================
/**
 * Type guard for checking whether the entities provided is playlists'
 * entities or videos' entities
 *
 * @param entities
 * @returns
 */
export const isPlaylistsEntities = (
  entities: PlaylistsOrVideosEntities | ListToPlayEntities
): entities is PlaylistsEntities =>
  (entities as PlaylistsEntities).playlists !== undefined;

/**
 * Type guard for checking whether the supplied snippet belongs to playlist/video
 *
 * @param snippet Playlist or video item snippet
 * @returns
 */
export const isPlaylistItemSnippet = (
  snippet: PlaylistItemSnippet | VideoItemSnippet
): snippet is PlaylistItemSnippet =>
  (snippet as PlaylistItemSnippet).playlistId !== undefined;

export const isPlaylistOrVideoResult = (
  result: string[] | ListToPlayResultItem[]
): result is string[] => typeof result[0] === "string";

// =======================================
// End Type Guards
// =======================================

// =======================================
// Assertion
// =======================================
export const isSnippetDuplicated = (
  originalEntities: PlaylistsEntities,
  snippetId: string
) => {
  return some(
    originalEntities.playlistItems,
    (playlistItem) => playlistItem.snippet === snippetId
  );
};

/**
 * Check if particular item from playlists/videos exists in listToPlay
 *
 * @param entities Normalized listToPlay entities
 * @param schema listToPlay item schema (playlistItems/videoItems)
 * @param itemId listToPlay item's id
 */
export const isListToPlayItemExists = (
  entities: ListToPlayEntities,
  schema: SchemaType,
  itemId: string
) => !!entities[schema][itemId];

/**
 * Check if playlist item with the provided itemId exists.
 * If no then the itemId is belonged to videos
 *
 * @param playlistItems Normalized playlist/video items entity
 * @param itemId Item id to check
 * @returns boolean result of true if playlist item exists
 */
export const isPlaylistItemExists = (
  playlistItems: PlaylistItemsEntity,
  itemId: string
) => !!playlistItems[itemId];
// =======================================
// End Assertion
// =======================================

// =======================================
// Util functions
// =======================================
/**
 * Deep merge entities (and accompanying result array) into
 * existing store states.
 *
 * **_Note: This function mutates draft_**
 *
 * @param draft Drafted proxy states of store states provided by immer
 * @param entities Normalized states entities to be added
 * @param result Normalized states result to be added
 * @returns Mutated (drafted) states
 */
export const deepMergeStates = <T extends PlaylistsOrVideos | ListToPlay>(
  draft: T,
  entities: T["entities"],
  result: T["result"]
): T => {
  merge(draft.entities, entities);

  // make sure no duplicated video/playlist exists
  // in their result array
  if (
    isPlaylistOrVideoResult(draft.result) &&
    isPlaylistOrVideoResult(result)
  ) {
    const prevResult = draft.result;
    draft.result = uniq([...prevResult, ...result]);
    return draft;
  }

  // listToPlay result array is already checked on saga side
  draft.result = result;

  return draft;
};

/**
 *
 * Updates playlist/video source name by id
 *
 * **_Note: This function mutates draft_**
 *
 * @param draft Drafted proxy states of store states provided by immer
 * @param mediaItem
 * @returns Mutated draft
 */
export const updatePlaylistOrVideoNameById = <T extends PlaylistsOrVideos>(
  draft: T,
  mediaItem: MediaItem
): T => {
  const { id, name, source } = mediaItem;

  const sourcePath = `entities.${source}.[${id}]`;

  if (has(draft, sourcePath)) set(draft, `${sourcePath}.name`, name);

  return draft;
};

/**
 * Delete playlist/video item entity
 *
 * **_Note: This function mutates itemsEntity_**
 *
 * @param entities Playlist/video entities containing items to be deleted
 * @param itemIds ItemIds of items to be deleted
 */
export const deleteItemsEntity = (
  entities: PlaylistsOrVideosEntities,
  itemIds: string[]
) => {
  itemIds.forEach((itemId) => {
    if (isPlaylistsEntities(entities)) {
      delete entities.playlistItems[itemId];
      return;
    }

    delete entities.videoItems[itemId];
  });
};

/**
 * Delete playlist/video snippets
 *
 * This function should be always executed after
 * deleting items, else isSnippetDuplicated assertion
 * will be failed
 *
 * **_Note: This function mutates entities_**
 *
 * @param entities Playlist/video entities
 * @param snippetIds Snippet ids array to delete
 */
export const deleteSnippetsEntity = (
  entities: PlaylistsOrVideosEntities,
  snippetIds: string[]
) => {
  const snippetsEntity = entities?.snippets;

  if (!snippetsEntity) return;

  snippetIds.forEach((snippetId) => {
    // do not delete snippet if there is another reference
    // to the snippet (duplicated snippet)
    if (
      isPlaylistsEntities(entities) &&
      isSnippetDuplicated(entities, snippetId)
    )
      return;

    delete snippetsEntity[snippetId];
  });
};

/**
 * General method for deleting playlist/video by id
 *
 * **_Note: This function mutates draft_**
 *
 * @param draft Drafted proxy states of store states provided by immer
 * @param id Playlist/video id to delete
 * @returns Mutated draft
 */
export const deletePlaylistOrVideoById = <T extends PlaylistsOrVideos>(
  draft: T,
  id: string
): T => {
  const { entities, result } = draft;

  // do nothing if id cannot be found
  if (!result.includes(id)) return draft;

  const sourceEntity = isPlaylistsEntities(entities)
    ? entities.playlists
    : entities.videos;
  const itemsEntity = isPlaylistsEntities(entities)
    ? entities.playlistItems
    : entities.videoItems;

  const itemIds = sourceEntity[id]?.items;

  // lodash/at unable to resolve snippet's stringify property path of [id].snippet type
  // which is a string array
  // type assertion to generic array as a workaround
  const snippetIds = at(
    itemsEntity,
    itemIds.map((id) => `[${id}].snippet`)
  ) as [];

  // delete related source
  delete sourceEntity[id];

  // delete related playlist/video items
  deleteItemsEntity(entities, itemIds);

  // delete related snippets
  deleteSnippetsEntity(entities, snippetIds);

  // delete related id in result array
  pull(result, id);

  return draft;
};

/**
 * Delete individual playlistItem.
 *
 * **_Note: This function mutates entities_**
 *
 * @param entities
 * @param playlistId
 * @param itemId
 */
export const deletePlaylistItem = (
  entities: PlaylistsEntities,
  playlistId: string,
  itemId: string
) => {
  // do nothing if playlistItem could not be found
  if (!entities.playlistItems[itemId]) return;

  const snippetIdToDelete = entities.playlistItems[itemId].snippet;

  // delete playlistItem first
  // NOTE: this is important to avoid false positive
  //       for isSnippetDuplicated assertion below
  //       as it will always give the result of
  //       snippet is duplicated every time this
  //       playlistItem is detected
  deleteItemsEntity(entities, [itemId]);

  deleteSnippetsEntity(entities, [snippetIdToDelete]);

  remove(
    entities.playlists[playlistId].items,
    (playlistItemId) => playlistItemId === itemId
  );
};

/**
 * Delete listToPlay item by itemId given.
 *
 * **_Note: This function mutates draft_**
 *
 * @param draft Drafted proxy states of store states provided by immer
 * @param id Item id to be deleted
 * @returns
 */
export const deleteListToPlayItemById = (
  draft: ListToPlay,
  id: string
): ListToPlay => {
  const [removedItem] = remove(draft.result, (item) => item.id === id);

  // do nothing if item cannot be found
  if (!removedItem) return draft;

  // remove and delete entities if item is found
  delete draft.entities[removedItem.schema][removedItem.id];

  return draft;
};

/**
 * Remove the specified item from items and return it. Wrapper around lodash remove
 *
 * @param items Result items from normalized Redux store
 * @param itemId Id of item to remove
 */
export const removeResultItem = (
  items: ListToPlayResultItem[],
  itemId: string
) => {
  const [removedItem] = remove(items, (item) => item.id === itemId);

  if (!removedItem) throw new Error("Item not found in listToPlay");

  return removedItem;
};

// =======================================
// End Util functions
// =======================================

// =======================================
// Utils for selectors
// =======================================
/**
 * Get snippet of playlist/video item from itemId provided. Returns snippet if
 * snippet could be found using itemId, else return undefined
 *
 * @param entities Playlists or videos entities used to get snippetId
 * @param itemId Id of item to search for
 * @returns snippet obtained or undefined
 *
 */
export const getSnippetFromItemId = (
  entities: PlaylistsOrVideosEntities,
  itemId: string
) => {
  const snippetId = isPlaylistsEntities(entities)
    ? entities.playlistItems[itemId]?.snippet
    : entities.videoItems[itemId]?.snippet;

  const snippet = entities.snippets[snippetId];

  // assign snippet's key as the id of the returning object
  // for the usage in views
  return (
    snippet && {
      ...snippet,
      id: snippetId,
    }
  );
};

/**
 * Use getSnippetFromItemId to get snippet, but append itemId to the resulting snippet obtained
 * For the usage in filtering list items
 *
 * @param entities Normalized playlist/video entities
 * @param itemId Id of item to search for
 * @returns snippet with itemId appended, else undefined if no snippet found
 *
 */
export const getSnippetWithCombinedItemId = (
  entities: PlaylistsOrVideosEntities,
  itemId: string
) => {
  const snippet = getSnippetFromItemId(entities, itemId);

  return (
    snippet && {
      ...snippet,
      itemId,
    }
  );
};
