import { useEffect } from "react";

import Tracker from "@src/tracker";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import {
  getCurrentVersion,
  getFramework,
  getIsTrackingAvailable,
  getRepoName,
  getShortId,
} from "@src/modules/environment";
import { getLibraries } from "@src/modules/slices";
import { useRouter } from "next/router";

const useSMTracker = () => {
  const {
    libraries,
    repoName,
    shorId,
    isTrackingAvailable,
    currentVersion,
    framework,
  } = useSelector((state: SliceMachineStoreType) => ({
    isTrackingAvailable: getIsTrackingAvailable(state),
    currentVersion: getCurrentVersion(state),
    framework: getFramework(state),
    shorId: getShortId(state),
    repoName: getRepoName(state),
    libraries: getLibraries(state),
  }));

  const router = useRouter();

  useEffect(() => {
    Tracker.get().initialize(
      process.env.NEXT_PUBLIC_SM_UI_SEGMENT_KEY ||
        "Ng5oKJHCGpSWplZ9ymB7Pu7rm0sTDeiG",
      isTrackingAvailable
    );

    void Tracker.get().groupLibraries(libraries, repoName, currentVersion);

    shorId && Tracker.get().identifyUser(shorId);

    // For initial loading
    void Tracker.get().trackPageView(framework, currentVersion);
  }, []);

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
