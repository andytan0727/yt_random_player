import { VideoList } from "components/Lists";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "store";
import { selectPlaylistSnippetsByPlaylistId } from "store/ytplaylist/playlistSelectors";

import { Close as CloseIcon } from "@material-ui/icons";

import styles from "./styles.module.scss";

interface ViewPlaylistPanelProps {
  playlistId: string;
  handleCloseViewPlaylist: () => void;
}

const ViewPlaylistPanel = (props: ViewPlaylistPanelProps) => {
  const { playlistId, handleCloseViewPlaylist } = props;
  const snippets = useSelector((state: AppState) =>
    selectPlaylistSnippetsByPlaylistId(state, playlistId)
  );

  return (
    <div className={styles.viewPlaylistDiv}>
      <button className={styles.closeButton} onClick={handleCloseViewPlaylist}>
        <CloseIcon />
      </button>
      <VideoList items={snippets} height={450} />
    </div>
  );
};

export default ViewPlaylistPanel;
