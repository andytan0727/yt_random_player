import { ShowLgPanelDialogBtn } from "components/Buttons";
import { LgPanelDialog } from "components/Dialog";
import { PlayerList } from "components/Lists";
import VideoPlayer from "components/Players/Video/VideoPlayer";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurSongIdx } from "store/ytplayer/action";
import { selectCurSongIdx } from "store/ytplayer/selector";
import { selectListToPlayResultSnippets } from "store/ytplaylist/listToPlaySelectors";

import NoVideoFound from "../NoVideoFound";
import styles from "./styles.module.scss";

const YTPlayerPage = () => {
  const curSongIdx = useSelector(selectCurSongIdx);
  const listToPlaySnippets = useSelector(selectListToPlayResultSnippets);
  const dispatch = useDispatch();
  const currentSnippet = listToPlaySnippets[curSongIdx];

  const [open, setOpen] = useState(false);

  useEffect(() => {
    // reset curSongIdx to prevent bugs when routing pages
    dispatch(setCurSongIdx(0));

    return () => {
      // also reset curSongIdx and document title when un-mounting
      dispatch(setCurSongIdx(0));
      document.title = "Shuffler";
    };
  }, [dispatch]);

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
  }, []);

  return listToPlaySnippets.length !== 0 ? (
    <div className={styles.ytPlayerDiv}>
      <div className={styles.player}>
        <h3 className={styles.videoTitle}>
          {currentSnippet && currentSnippet.title}
        </h3>
        <VideoPlayer />
      </div>
      <div className={styles.playlist}>
        <div className={styles.playlistHeader}>
          <h3 className={styles.playerListTitle}>
            <span role="img" aria-label="currently-playing">
              📻
            </span>
            &nbsp;Currently playing:{" "}
            {`${curSongIdx + 1}/${listToPlaySnippets.length}`}
          </h3>

          <div
            style={{
              marginRight: "auto",
            }}
          ></div>
          <ShowLgPanelDialogBtn handleOpenDialog={handleOpenDialog} />
        </div>

        <PlayerList items={listToPlaySnippets} />

        {/* a temporary dialog with portable playlistInput LgPanel */}
        <LgPanelDialog open={open} handleCloseDialog={handleCloseDialog} />
      </div>
    </div>
  ) : (
    <NoVideoFound />
  );
};

export default YTPlayerPage;
