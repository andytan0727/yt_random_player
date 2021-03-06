import classNames from "classnames";
import React, { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurSongIdx } from "store/ytplayer/action";
import { selectCurSongIdx } from "store/ytplayer/selector";
import { selectListToPlayResultSnippets } from "store/ytplaylist/listToPlaySelectors";
import { setEscOverlay, useKeyDown } from "utils/helper/keyboardShortcutHelper";

import {
  Close as CloseIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@material-ui/icons";

import styles from "./styles.module.scss";

interface MiniPlayerListProps {
  handleHideMiniPlayerList: (e?: React.KeyboardEvent) => void;
}

const MiniPlayerList = (props: MiniPlayerListProps) => {
  const { handleHideMiniPlayerList } = props;
  const listRef = useRef<any>(null);
  const curSongIdx = useSelector(selectCurSongIdx);
  const listToPlaySnippets = useSelector(selectListToPlayResultSnippets);
  const dispatch = useDispatch();
  const listLen = listToPlaySnippets.length;
  const displayList = listToPlaySnippets.slice(curSongIdx + 1, listLen);

  const handleClickSong = useCallback(
    (e) => {
      const songToPlay = e.currentTarget.getAttribute("data-index");
      dispatch(setCurSongIdx(parseInt(songToPlay)));
    },
    [dispatch]
  );

  const handleScrollToListTop = useCallback(() => {
    listRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // set shortcut to close MiniPlayerList overlay
  useKeyDown(setEscOverlay(handleHideMiniPlayerList));

  return (
    <div className={styles.miniPlayerListDiv}>
      <button
        className={styles.closeButton}
        onClick={useCallback((e) => handleHideMiniPlayerList(e), [
          handleHideMiniPlayerList,
        ])}
      >
        <CloseIcon />
      </button>
      <div className={styles.nowPlaying}>
        {listToPlaySnippets[curSongIdx].thumbnails ? (
          <img
            className={styles.nowPlayingThumbnail}
            src={listToPlaySnippets[curSongIdx].thumbnails!.high.url}
            alt="thumbnail"
          />
        ) : (
          <div
            className={classNames(
              styles.nowPlayingThumbnail,
              styles.deletedVideo
            )}
          ></div>
        )}
        <h3>{listToPlaySnippets[curSongIdx].title}</h3>
      </div>
      <div className={styles.list}>
        <button
          className={styles.scrollTopFab}
          color="primary"
          onClick={handleScrollToListTop}
        >
          <KeyboardArrowUpIcon />
        </button>
        {listLen !== 0 && (
          <ul ref={listRef}>
            {displayList.map((snippet, idx) => (
              <li
                key={snippet.id}
                className={styles.song}
                onClick={handleClickSong}
                data-index={curSongIdx + 1 + idx}
              >
                {snippet.thumbnails ? (
                  <img
                    className={styles.thumbnail}
                    src={snippet.thumbnails.default.url}
                    alt="thumbnail"
                  />
                ) : (
                  <div className={styles.deletedVideoThumbnail}></div>
                )}
                <span>{snippet.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MiniPlayerList;
