import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { connect } from "react-redux";
import MusicVideoIcon from "@material-ui/icons/MusicVideo";
import { setCheckedVideos } from "../../../store/ytplaylist/action";
import SearchInput from "../../InputComponents/SearchInput";
import SearchVideoInput from "./SearchVideoInput";
import VideosPanelBtnGroup from "../../ButtonComponents/VideosPanelBtnGroup";

import styles from "./styles.module.scss";

const VideosPanel = (props) => {
  const {
    ytplaylist: { videos, checkedVideos, playingVideos },
    setCheckedVideos,
  } = props;

  const handleSelectVideoItem = (e) => {
    const selectedVideoId = e.currentTarget.getAttribute("data-videoid");
    const currentIndex = checkedVideos.indexOf(selectedVideoId);
    const newSelected = [...checkedVideos];

    if (currentIndex === -1) {
      newSelected.push(selectedVideoId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setCheckedVideos(newSelected);
  };

  return (
    <React.Fragment>
      <div className={styles.videosPanelDiv}>
        <SearchVideoInput name="search-video" placeholder="Video Url">
          {({ ref, ...videosInputProps }) => (
            <SearchInput ref={ref} {...videosInputProps} />
          )}
        </SearchVideoInput>
        <div className={styles.videos}>
          {videos.length !== 0 ? (
            videos.map((video) => (
              <React.Fragment key={video.id}>
                <div
                  className={classNames(styles.videosItem, {
                    [styles.checkedVideos]: checkedVideos.includes(video.id),
                  })}
                  onClick={handleSelectVideoItem}
                  data-videoid={video.id}
                >
                  <div>
                    {playingVideos.includes(video.id) && <MusicVideoIcon />}
                    <span>{video.name || video.items[0].snippet.title}</span>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div>
              <h3>No Video Found</h3>
            </div>
          )}
        </div>

        <VideosPanelBtnGroup />
      </div>
    </React.Fragment>
  );
};

VideosPanel.propTypes = {
  ytplaylist: PropTypes.object.isRequired,
  setCheckedVideos: PropTypes.func.isRequired,
};

const mapStatesToVideosPanelProps = ({ ytplaylist }) => ({
  ytplaylist,
});

export default connect(
  mapStatesToVideosPanelProps,
  {
    setCheckedVideos,
  }
)(VideosPanel);