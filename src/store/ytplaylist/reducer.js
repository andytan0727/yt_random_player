import produce, { original } from "immer";
import uniqBy from "lodash.uniqby";
import union from "lodash.union";
import {
  ADD_PLAYLIST,
  REMOVE_PLAYLIST,
  RENAME_PLAYLIST,
  SET_CHECKED_PLAYLISTS,
  ADD_LIST_TO_PLAY,
  UPDATE_LIST_TO_PLAY,
  CLEAR_LIST_TO_PLAY,
  ADD_PLAYING_PLAYLISTS,
  REMOVE_PLAYLIST_FROM_PLAYING,

  // videos
  ADD_VIDEO,
  REMOVE_VIDEO,
  DELETE_VIDEO,
  SET_CHECKED_VIDEOS,
  ADD_PLAYING_VIDEOS,
  REMOVE_PLAYING_VIDEOS,
  APPEND_LIST_TO_PLAY,
} from "../../utils/constants/actionConstants";

const initialState = {
  checkedPlaylists: [], // pushed playlistId from selected playlists
  checkedVideos: [], // pushed videoId from checkbox
  playlists: [
    // {
    //   id: "",
    //   name: "",
    //   items: [{}]
    // }
  ],
  videos: [
    // {
    //   id: "",
    //   items: [{}]
    // }
  ],
  listToPlay: [],
  playingPlaylists: [], // id array storing playlists added to playing list
  playingVideos: [], // [ id1, id2, id3 ]
};

export const ytplaylist = produce((draft, action) => {
  switch (action.type) {
    case ADD_PLAYLIST: {
      const playlistToAdd = action.payload.playlist;
      const isPlaylistExists = draft.playlists.some(
        (playlist) => playlist.id === playlistToAdd.id
      );

      // return if playlist already existed
      if (isPlaylistExists) return draft;

      // proceeds to add playlist if it does not exist yet
      draft.playlists.push(playlistToAdd);
      return draft;
    }

    case REMOVE_PLAYLIST: {
      const { updatedPlaylist, updatedPlayingPlaylists } = action.payload;

      // update playlists, playingPlaylists and checkedPlaylists
      draft.playlists = updatedPlaylist;
      draft.playingPlaylists = updatedPlayingPlaylists;
      draft.checkedPlaylists = [];
      return draft;
    }

    case RENAME_PLAYLIST: {
      draft.playlists = action.payload.updatedPlaylists;
      return draft;
    }

    case SET_CHECKED_PLAYLISTS: {
      // clear checked videos before operating checked videos
      // prevent error caused by simultaneously checked videos and playlists
      if (draft.checkedVideos.length !== 0) {
        draft.checkedVideos = [];
      }

      draft.checkedPlaylists = action.payload.checkedPlaylists;
      return draft;
    }

    case ADD_PLAYING_PLAYLISTS: {
      const playlistIds = action.payload.playlistIds;
      const prevPlayingPlaylists = original(draft.playingPlaylists);
      draft.playingPlaylists = union(prevPlayingPlaylists, playlistIds);
      return draft;
    }

    case REMOVE_PLAYLIST_FROM_PLAYING: {
      draft.playingPlaylists = action.payload.updatedPlayingPlaylists;
      return draft;
    }

    // ------------------------------------------
    // videos
    // ------------------------------------------
    case ADD_VIDEO: {
      const { videoToAdd } = action.payload;

      const isVideoExists = draft.videos.some(
        (video) => video.id === videoToAdd.id
      );

      // return if video exists
      if (isVideoExists) {
        return draft;
      }

      draft.videos.push(videoToAdd);
      return draft;
    }

    case REMOVE_VIDEO: {
      draft.videos = action.payload.updatedVideos;
      draft.checkedVideos = [];
      return draft;
    }

    case DELETE_VIDEO: {
      draft.videos = action.payload.videos;
      return draft;
    }

    case SET_CHECKED_VIDEOS: {
      // clear checked playlists before operating checked videos
      // prevent error caused by simultaneously checked videos and playlists
      if (draft.checkedPlaylists.length !== 0) {
        draft.checkedPlaylists = [];
      }

      draft.checkedVideos = action.payload.checkedVideos;
      return draft;
    }

    case ADD_PLAYING_VIDEOS: {
      const videoIds = action.payload.videoIds;
      const prevPlayingVideos = original(draft.playingVideos);
      draft.playingVideos = union(prevPlayingVideos, videoIds);
      return draft;
    }

    case REMOVE_PLAYING_VIDEOS: {
      draft.playingVideos = action.payload.playingVideos;

      return draft;
    }

    // ------------------------------------------
    // list to play / playingList
    // ------------------------------------------
    case ADD_LIST_TO_PLAY: {
      const { updatedPlayingPlaylists, checkedListToClear } = action.payload;

      draft.playingPlaylists = updatedPlayingPlaylists;

      if (checkedListToClear === "playlist") {
        draft.checkedPlaylists = [];
      } else {
        draft.checkedVideos = [];
      }

      return draft;
    }

    case APPEND_LIST_TO_PLAY: {
      const items = action.payload.items;
      const prevListToPlay = original(draft.listToPlay);
      draft.listToPlay = uniqBy([...prevListToPlay, ...items], "id");
      return draft;
    }

    case UPDATE_LIST_TO_PLAY: {
      draft.listToPlay = action.payload.listToPlay;
      return draft;
    }

    case CLEAR_LIST_TO_PLAY: {
      // clear listToPlay
      draft.listToPlay = [];

      // clear playingPlaylists and playingVideos as well
      draft.playingPlaylists = [];
      draft.playingVideos = [];

      return draft;
    }

    default: {
      return draft;
    }
  }
}, initialState);
