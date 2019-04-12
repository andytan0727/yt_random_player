import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";
import CloseIcon from "@material-ui/icons/Close";
import MusicVideoIcon from "@material-ui/icons/MusicVideo";
import SearchInput from "../../InputComponents/SearchInput";
import SearchPlaylistInput from "./SearchPlaylistInput";
import VideoListPanelBtnGroup from "../../ButtonComponents/VideoListPanelBtnGroup";
import VideoList from "../../ListComponents/VideoList";

import {
  setCheckedPlaylists,
  renamePlaylist,
} from "../../../store/ytplaylist/action";

import styles from "./styles.module.scss";

const VideoListPanel = (props) => {
  const {
    ytplaylist: { playlists, checkedPlaylists, playingPlaylists },
    setCheckedPlaylists,
    renamePlaylist,
  } = props;

  const [viewPlaylist, setViewPlaylist] = useState(false);
  const [playlistToView, setPlaylistToView] = useState([]);
  const [editName, setEditName] = useState({});

  const _checkPlaylist = (playlistId) => {
    const currentIndex = checkedPlaylists.indexOf(playlistId);
    const newSelected = [...checkedPlaylists];

    if (currentIndex === -1) {
      newSelected.push(playlistId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setCheckedPlaylists(newSelected);
  };

  const handleCloseViewPlaylist = () => {
    setViewPlaylist(false);
    setCheckedPlaylists([]);
  };

  const handleDoubleClick = (e) => {
    const selectedPlaylistId = e.currentTarget.getAttribute("data-playlistid");
    setEditName({
      [selectedPlaylistId]: true,
    });
    _checkPlaylist(selectedPlaylistId);
  };

  const handleEditNameInputChange = (e) => {
    const playlistId = e.target.nextElementSibling.getAttribute(
      "data-playlistid"
    );
    renamePlaylist(e.target.value, playlistId);
  };

  const handleEditNameInputBlur = () => {
    setEditName({});
    setCheckedPlaylists([]);
  };

  const handleMouseEnterSelect = (e) => {
    const selectedPlaylistId = e.currentTarget.getAttribute("data-playlistid");
    _checkPlaylist(selectedPlaylistId);
  };

  useEffect(() => {
    if (Object.keys(editName).length) {
      const input = document.querySelector('input[name="edit-name"]');
      input.focus();
    }
  }, [editName]);

  useEffect(() => {
    if (viewPlaylist && playlists.length) {
      setPlaylistToView(
        playlists.filter((playlist) => playlist.id === checkedPlaylists[0])[0]
          .items
      );
    }
  }, [viewPlaylist]);

  return (
    <React.Fragment>
      <div className={styles.videoListPanelDiv}>
        <SearchPlaylistInput name="search-playlist" placeholder="Playlist Url">
          {({ ref, ...playlistInputProps }) => (
            <SearchInput ref={ref} {...playlistInputProps} />
          )}
        </SearchPlaylistInput>
        <div className={styles.videoListItems}>
          {playlists.length !== 0 ? (
            playlists.map((playlist) => (
              <React.Fragment key={playlist.id}>
                <div
                  className={classNames(styles.videoListItem, {
                    [styles.checkedPlaylists]: checkedPlaylists.includes(
                      playlist.id
                    ),
                  })}
                >
                  <div>
                    {editName[playlist.id] && (
                      <input
                        className={classNames(
                          styles.editNameInput,
                          `edit-name-${playlist.id}`
                        )}
                        name="edit-name"
                        value={playlist.name}
                        onChange={handleEditNameInputChange}
                        onBlur={handleEditNameInputBlur}
                      />
                    )}
                    <span
                      onDoubleClick={handleDoubleClick}
                      onMouseEnter={handleMouseEnterSelect}
                      data-playlistid={playlist.id}
                    >
                      {playlist.name || `Playlist - ${playlist.id}`}
                    </span>
                    {playingPlaylists.includes(playlist.id) && (
                      <MusicVideoIcon />
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div>
              <h3>No Playlist Found</h3>
            </div>
          )}
        </div>

        <VideoListPanelBtnGroup setViewPlaylist={setViewPlaylist} />
      </div>
      {viewPlaylist && (
        <div className={styles.viewPlaylistDiv}>
          <button
            className={styles.closeButton}
            onClick={handleCloseViewPlaylist}
          >
            <CloseIcon />
          </button>
          {playlistToView.length ? (
            <VideoList items={playlistToView} height={450} />
          ) : (
            <h3>No Playlist</h3>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

VideoListPanel.propTypes = {
  ytplaylist: PropTypes.object.isRequired,
  setCheckedPlaylists: PropTypes.func.isRequired,
  renamePlaylist: PropTypes.func.isRequired,
};

const mapStatesToVideoListPanelProps = ({ ytplaylist }) => ({
  ytplaylist,
});

export default connect(
  mapStatesToVideoListPanelProps,
  {
    setCheckedPlaylists,
    renamePlaylist,
  }
)(VideoListPanel);
