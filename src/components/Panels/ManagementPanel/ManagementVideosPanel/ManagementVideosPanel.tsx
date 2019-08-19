import { useCheckbox } from "components/Checkbox/hooks";
import { makeManagementPanelSearchInput } from "components/Inputs";
import {
  createItemData,
  ManagementPanelVirtualList,
  PlaylistVideoListItemSecondaryAction,
  withListItemSecondaryAction,
} from "components/Lists/ManagementPanelVirtualList";
import React from "react";
import { useSelector } from "react-redux";
import { selectAllVideoItemIds } from "store/ytplaylist/videoSelectors";

import { Divider, Typography } from "@material-ui/core";

import styles from "./styles.module.scss";

const SearchVideoInput = makeManagementPanelSearchInput("videos");

const ManagementPanelVirtualListVideoItem = withListItemSecondaryAction(
  PlaylistVideoListItemSecondaryAction
);

const ManagementVideosPanel = () => {
  const videoItemIds = useSelector(selectAllVideoItemIds);
  const checkboxHooks = useCheckbox();
  const videoItemData = createItemData({
    ...checkboxHooks,
    items: videoItemIds,
  });

  return (
    <div className={styles.managementVideosPanelDiv}>
      <Typography className={styles.header} variant="h4">
        My Video
      </Typography>
      <div className={styles.header}>
        <SearchVideoInput />
      </div>

      <Divider className={styles.header} />
      <ManagementPanelVirtualList itemData={videoItemData}>
        {ManagementPanelVirtualListVideoItem}
      </ManagementPanelVirtualList>
    </div>
  );
};

export default ManagementVideosPanel;
