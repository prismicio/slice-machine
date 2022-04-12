import { useEffect } from "react";

import Tracker from "@src/tracker";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getCurrentVersion,
  getFramework,
  getRepoName,
  getShortId,
  getIntercomHash,
} from "@src/modules/environment";
import { getLibraries } from "@src/modules/slices";
import { useRouter } from "next/router";

const useSMTracker = () => {
  const {
    libraries,
    repoName,
    shortId,
    intercomHash,
    currentVersion,
    framework,
  } = useSelector((state: SliceMachineStoreType) => ({
    currentVersion: getCurrentVersion(state),
    framework: getFramework(state),
    shortId: getShortId(state),
    intercomHash: getIntercomHash(state),
    repoName: getRepoName(state),
    libraries: getLibraries(state),
  }));

  const router = useRouter();

  useEffect(() => {
    void Tracker.get().groupLibraries(libraries, repoName, currentVersion);

    // For initial loading
    void Tracker.get().trackPageView(framework, currentVersion);
  }, []);

  // Handles if the user login/logout outside of the app.
  useEffect(() => {
    if (shortId && intercomHash)
      void Tracker.get().identifyUser(shortId, intercomHash);
  }, [shortId, intercomHash]);

  // For handling page change
  useEffect(() => {
    const handleRouteChange = () => {
      void Tracker.get().trackPageView(framework, currentVersion);
    };
    // When the component is mounted, subscribe to router changes
    // and log those page views
    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return;
};

export default useSMTracker;
