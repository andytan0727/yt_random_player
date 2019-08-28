import {
  LgPanelCtrlBtnGroup,
  RenamePlaylistButton,
  SyncPlaylistButton,
} from "components/Buttons";
import { useCheckbox } from "components/Checkbox/hooks";
import { FilterSnippetInput } from "components/Inputs";
import {
  createItemData,
  LgPanelVirtualList,
  PlaylistVideoListItemSecondaryAction,
  withListItemSecondaryAction,
} from "components/Lists/LgPanelVirtualList";
import SyncPlaylistLoader from "components/Loadings/SyncPlaylistLoader";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AppState } from "store";
import { selectFilteredSnippets } from "store/ytplaylist/filteredSelectors";
import { updateListToPlayAction } from "store/ytplaylist/listToPlayActions";
import {
  deletePlaylistItemByIdAction,
  shufflePlaylistItems,
  syncPlaylistFromYTByIdAction,
  updatePlaylistNameByIdAction,
} from "store/ytplaylist/playlistActions";
import {
  selectPlaylistItemIdsByPlaylistId,
  selectPlaylistNameById,
  selectPlaylistUpdating,
} from "store/ytplaylist/playlistSelectors";
import { generateCustomSwal, notify } from "utils/helper/notifyHelper";

import { Divider, Typography } from "@material-ui/core";

import styles from "./styles.module.scss";

interface LgPlaylistPanelProps extends RouteComponentProps {
  match: MatchRoute;
}

const LgPanelVirtualListPlaylistItem = withListItemSecondaryAction(
  PlaylistVideoListItemSecondaryAction
);

const LgPlaylistPanel = ({ match, history }: LgPlaylistPanelProps) => {
  const playlistId: string = match.params.id;
  const dispatch = useDispatch();
  const playlistName = useSelector((state: AppState) =>
    selectPlaylistNameById(state, playlistId)
  );
  const playlistItemIds = useSelector((state: AppState) =>
    selectPlaylistItemIdsByPlaylistId(state, playlistId)
  ) as string[];
  const checkboxHooks = useCheckbox();
  const { checked } = checkboxHooks;
  const updating = useSelector(selectPlaylistUpdating);

  const filteredSnippets = useSelector(selectFilteredSnippets);
  const playlistItemData = createItemData({
    ...checkboxHooks,
    items: playlistItemIds,
    filteredSnippets,
  });

  const handlePlayPlaylist = useCallback(() => {
    dispatch(
      updateListToPlayAction(
        "playlistItems",
        playlistId,
        checked.length === 0 ? playlistItemIds : checked
      )
    );

    history.push("/player/ytplayer");
  }, [checked, dispatch, history, playlistId, playlistItemIds]);

  const handleShufflePlaylist = useCallback(() => {
    dispatch(shufflePlaylistItems(playlistId));
  }, [playlistId, dispatch]);

  const handleDeletePlaylistItems = useCallback(() => {
    checked.forEach((itemId) => {
      dispatch(deletePlaylistItemByIdAction(playlistId, itemId));
    });
  }, [checked, dispatch, playlistId]);

  const handleRenamePlaylist = useCallback(async () => {
    const customSwal = await generateCustomSwal();
    const result = await customSwal!.fire({
      title: "Enter new playlist name",
      input: "text",
      showCancelButton: true,
      confirmButtonText: "Ok, Done! 🔥",
      cancelButtonText: "Cancel",
    });
    const newName = result.value;

    if (newName) {
      dispatch(updatePlaylistNameByIdAction(playlistId, newName));
      notify("success", "Successfully renamed playlist 😎");
    }
  }, [dispatch, playlistId]);

  // sync playlist by fetching latest data from upstream (YouTube)
  const handleSyncPlaylist = useCallback(async () => {
    dispatch(syncPlaylistFromYTByIdAction(playlistId));
  }, [dispatch, playlistId]);

  return (
    <React.Fragment>
      <SyncPlaylistLoader open={updating} />
      <div className={styles.lgPlaylistPanelDiv}>
        <Typography variant="h4" className={styles.title}>
          {playlistName || `Playlist-${playlistId}`}
        </Typography>
        <div className={styles.ctrlPanelDiv}>
          <FilterSnippetInput
            itemIds={playlistItemIds}
            uniqueIdentifier={playlistId}
          />
          <LgPanelCtrlBtnGroup
            handlePlay={handlePlayPlaylist}
            handleShuffle={handleShufflePlaylist}
            handleDelete={handleDeletePlaylistItems}
          />
          <RenamePlaylistButton handleRename={handleRenamePlaylist} />
          <SyncPlaylistButton handleSyncPlaylist={handleSyncPlaylist} />
        </div>
        <Divider />
        <LgPanelVirtualList itemData={playlistItemData}>
          {LgPanelVirtualListPlaylistItem}
        </LgPanelVirtualList>
      </div>
    </React.Fragment>
  );
};

export default withRouter(LgPlaylistPanel);
