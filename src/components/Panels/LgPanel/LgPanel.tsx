import FullPageSpinner from "components/Loadings/FullPageSpinner";
import React, { lazy, Suspense, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { delayLazy, retryLazy } from "utils/helper/lazyImportHelper";

import LgPanelDrawer from "./LgPanelDrawer";
import styles from "./styles.module.scss";

interface LgPanelProps {
  match: MatchRoute;
}

const LgVideosPanel = lazy(() =>
  delayLazy(() => retryLazy(() => import("./LgVideosPanel")))
);

const LgRecentlyPlayedPanel = lazy(() =>
  delayLazy(() => retryLazy(() => import("./LgRecentlyPlayedPanel")))
);

const LgNowPlayingPanel = lazy(() =>
  delayLazy(() => retryLazy(() => import("./LgNowPlayingPanel")))
);
const LgPlaylistsPanel = lazy(() =>
  delayLazy(() => retryLazy(() => import("./LgPlaylistsPanel")))
);

/**
 * LgPanel component
 *
 * A component that holds the routes for videos, playlists and other panels
 * related to video Lg
 *
 */
const LgPanel = ({ match }: LgPanelProps) => {
  const LgPanelPath = match.path;

  useEffect(() => {
    if (!localStorage.getItem("visited-panel")) {
      localStorage.setItem("visited-panel", "1");
    }
  }, []);

  return (
    <div className={styles.lgPanelDiv}>
      <Route component={LgPanelDrawer} />
      <Suspense fallback={<FullPageSpinner />}>
        <Switch>
          <Route path={`${LgPanelPath}/videos`} component={LgVideosPanel} />
          <Route
            path={`${LgPanelPath}/recent`}
            component={LgRecentlyPlayedPanel}
          />
          <Route
            path={`${LgPanelPath}/playing`}
            component={LgNowPlayingPanel}
          />
          <Route
            path={`${LgPanelPath}/playlists`}
            component={LgPlaylistsPanel}
          />
          <Redirect to={`${LgPanelPath}/playing`} />
        </Switch>
      </Suspense>
    </div>
  );
};

export default LgPanel;