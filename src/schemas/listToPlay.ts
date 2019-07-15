import { schema, NormalizedSchema, normalize, denormalize } from "normalizr";
import {
  ListToPlayEntities,
  ListToPlayResultItem,
  PlaylistItem,
  VideoItem,
  Video,
} from "store/ytplaylist/types";

const listToPlayVideoItem = new schema.Entity(
  "videoItems",
  {},
  {
    processStrategy: (entity: Video) => {
      const id = entity["id"];
      return {
        id,
        foreignKey: id,
      };
    },
  }
);

const listToPlayPlaylistItem = new schema.Entity(
  "playlistItems",
  {},
  {
    processStrategy: (entity: PlaylistItem) => {
      const {
        id,
        snippet: { playlistId },
      } = entity;

      return {
        id,
        foreignKey: playlistId,
      };
    },
  }
);

export const listToPlayItemSchema = new schema.Array(
  {
    playlistItems: listToPlayPlaylistItem,
    videoItems: listToPlayVideoItem,
  },
  (input) =>
    input.kind === "youtube#playlistItem" ? "playlistItems" : "videoItems"
);

export const normalizeListToPlay = (
  originalListToPlay: (PlaylistItem | VideoItem)[]
) => normalize(originalListToPlay, listToPlayItemSchema);

export const denormalizeListToPlay = (
  normalizedListToPlay: NormalizedSchema<
    ListToPlayEntities,
    ListToPlayResultItem
  >
) =>
  denormalize(
    normalizedListToPlay.result,
    listToPlayItemSchema,
    normalizedListToPlay.entities
  );
