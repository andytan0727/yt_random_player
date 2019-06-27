import { takeLatest, put, call, all } from "redux-saga/effects";
import { fetchYoutubeAPIData } from "../../utils/helper/fetchHelper";
import {
  FETCH_PLAYLIST_DATA,
  FETCH_VIDEO_DATA,
} from "../../utils/constants/actionConstants";
import {
  addPlaylistAction,
  addPlayingPlaylistsAction,
  addVideoAction,
  addPlayingVideosAction,
  appendListToPlayAction,
} from "../ytplaylist/action";
import {
  fetchPlaylistDataSuccessAction,
  fetchPlaylistDataFailedAction,
  addFetchedPlaylistIdAction,
  setPlaylistUrlAction,
  fetchVideoDataSuccessAction,
  fetchVideoDataFailedAction,
  addFetchedVideoIdAction,
  setVideoUrlAction,
} from "./action";
import { notify } from "../../utils/helper/notifyHelper";

/**
 * @typedef FetchDataActionType
 * @property {Object} payload
 * @property {string} payload.url Base url for HTTP request
 * @property {FetchParams} payload.params Extra params for request
 */

/**
 * Fetching videos information asynchronously from API to Redux
 * @param {FetchDataActionType} action
 */
export function* fetchPlaylistData(action) {
  const { url, params } = action.payload;
  try {
    let count = 2;
    const items = [];

    /** @type {Playlist} */
    let data = yield call(fetchYoutubeAPIData, url, params, "playlist");
    items.push(...data.items);

    while (data.nextPageToken) {
      if (count > 5) {
        alert(
          "Number of videos in your playlist exceeded limit set by us (250 videos/playlist)"
        );
        break;
      }

      data = yield call(
        fetchYoutubeAPIData,
        url,
        {
          ...params,
          pageToken: data.nextPageToken,
        },
        "playlist"
      );
      items.push(...data.items);
      count++;
    }

    if (
      ((Array.isArray && Array.isArray(items)) || items instanceof Array) &&
      items.length === 0
    )
      throw new Error("Fetch Playlist Failed: Empty Response");

    yield call(fetchPlaylistDataSuccess, items);
  } catch (err) {
    yield put(fetchPlaylistDataFailedAction());
    console.error(`Error in fetchPlaylistData: ${err}`);
    notify("error", "❌ Error in searching playlist!");
  } finally {
    // clear playlist url either success or failed
    yield put(setPlaylistUrlAction(""));
  }
}

/**
 * Saga to execute if fetch playlist data is successful
 *
 * @export
 * @param {Array<PlaylistItem>} dataItems
 */
export function* fetchPlaylistDataSuccess(dataItems) {
  const items = Array.from(dataItems);
  const id = items[0].snippet.playlistId;
  const fetchedPlaylist = {
    id,
    items,
  };

  yield put(fetchPlaylistDataSuccessAction(fetchedPlaylist));

  // add fetched playlist to playlists, listToPlay and playingPlaylists in redux store
  yield put(addPlaylistAction(fetchedPlaylist));
  yield put(appendListToPlayAction(items));
  yield put(addPlayingPlaylistsAction([id]));

  // add fetched playlist's id to redux store
  yield put(addFetchedPlaylistIdAction(id));
}

// =========================
// Videos
// =========================
/**
 * Fetching videos information asynchronously from API to Redux
 * @param {FetchDataActionType} action
 */
export function* fetchVideoData(action) {
  const { url, params } = action.payload;
  try {
    /** @type {Video} */
    const data = yield call(fetchYoutubeAPIData, url, params, "video");

    if (
      ((Array.isArray && Array.isArray(data.items)) ||
        data.items instanceof Array) &&
      data.items.length === 0
    )
      throw new Error("Fetch Video Failed: Empty Response");

    yield call(fetchVideoDataSuccess, data);
  } catch (err) {
    yield put(fetchVideoDataFailedAction());
    console.error(`Error in fetchVideoData: ${err}`);
    notify("error", "❌ Error in searching video!");
  } finally {
    // clear vieo url either success or failed
    yield put(setVideoUrlAction(""));
  }
}

/**
 * Saga to execut if video is successfully fetched
 *
 * @export
 * @param {Video} data
 */
export function* fetchVideoDataSuccess(data) {
  const items = Array.from(data.items);
  const id = items[0].id;
  const fetchedVideo = {
    id,
    items,
  };

  yield put(fetchVideoDataSuccessAction(data));

  // add fetched videos to videos, listToPlay and playingVideos in redux store
  yield put(addVideoAction(fetchedVideo));
  yield put(appendListToPlayAction(items));
  yield put(addPlayingVideosAction([id]));

  // add fetched video's id to redux store
  yield put(addFetchedVideoIdAction(id));
}

// =========================
// Saga Watchers
// =========================
function* fetchPlaylistDataWatcher() {
  // @ts-ignore
  // ignore vscode implicit checkJs
  // unable to resolve redux-saga typings problem using jsdoc
  yield takeLatest(FETCH_PLAYLIST_DATA, fetchPlaylistData);
}

function* fetchVideoDataWatcher() {
  // @ts-ignore
  // ignore vscode implicit checkJs
  // unable to resolve redux-saga typings problem using jsdoc
  yield takeLatest(FETCH_VIDEO_DATA, fetchVideoData);
}

export default function* ytapiSaga() {
  yield all([fetchPlaylistDataWatcher(), fetchVideoDataWatcher()]);
}
