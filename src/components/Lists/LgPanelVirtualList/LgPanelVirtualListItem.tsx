import React from "react";
import { useSelector } from "react-redux";
import { areEqual } from "react-window";
import { AppState } from "store";
import { selectSnippetByItemId } from "store/ytplaylist/generalSelectors";
import { PlaylistItemSnippet, VideoItemSnippet } from "store/ytplaylist/types";

import {
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";

import { ItemData } from "./LgPanelVirtualList";
import ListToPlayListItemSecondaryAction from "./ListToPlayListItemSecondaryAction";
import PlaylistVideoListItemSecondaryAction from "./PlaylistVideoListItemSecondaryAction";

interface WrappedSecondaryActionItemsProps {
  itemId: string;
  snippet: PlaylistItemSnippet | VideoItemSnippet;
}

interface LgPanelVirtualListItemProps {
  index: number;
  style: any;
  data: ItemData;
}

const useStyles = makeStyles({
  listItem: {
    height: "100%",
  },
  listItemText: {
    "& span": {
      display: "inline-block",
      paddingRight: 60,
    },
  },
});

/**
 * LgPanelVirtualListItem
 *
 * List item component for LgPanelVirtualList,
 *
 */
export const withListItemSecondaryAction = (
  WrappedSecondaryActionItems: React.FC<WrappedSecondaryActionItemsProps>
) =>
  // eslint-disable-next-line react/display-name
  React.memo((props: LgPanelVirtualListItemProps) => {
    const {
      index,
      style,
      data: { checked, handleCheckOrUncheckId, itemIds },
    } = props;
    const classes = useStyles();
    const currentItemId = itemIds[index];
    const currentSnippet = useSelector((state: AppState) =>
      selectSnippetByItemId(state, currentItemId)
    );

    return (
      <ListItem
        button
        divider
        disableRipple
        disableTouchRipple
        className={classes.listItem}
        onClick={handleCheckOrUncheckId(currentItemId)}
        ContainerProps={{
          style: {
            ...style,
            listStyleType: "none",
            border: currentSnippet ? "none" : "2px solid red",
          },
        }}
      >
        {currentSnippet ? (
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={checked.includes(currentItemId)}
              disableRipple
              inputProps={{ "aria-labelledby": currentSnippet.id }}
            />
          </ListItemIcon>
        ) : (
          <ListItemIcon>
            <CloseIcon color="error" />
          </ListItemIcon>
        )}

        <ListItemText
          className={classes.listItemText}
          primary={currentSnippet?.title || "No title"}
        />

        {/* ListItemSecondaryAction should be last child */}
        <ListItemSecondaryAction>
          {currentSnippet && (
            <WrappedSecondaryActionItems
              itemId={currentItemId}
              snippet={currentSnippet}
            />
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  }, areEqual);

export const LgPanelVirtualListToPlayItem = withListItemSecondaryAction(
  ListToPlayListItemSecondaryAction
);

export const LgPanelVirtualListPlaylistVideoItem = withListItemSecondaryAction(
  PlaylistVideoListItemSecondaryAction
);
