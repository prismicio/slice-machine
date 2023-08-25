import { useEffect } from "react";

import { telemetry } from "@src/apiClient";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getLibraries } from "@src/modules/slices";
import type { LibraryUI } from "@lib/models/common/LibraryUI";
import { useRouter } from "next/router";

import { managerClient } from "../managerClient";

const useSMTracker = () => {
  const { libraries } = useSelector((state: SliceMachineStoreType) => ({
    libraries: getLibraries(state),
  }));

  const router = useRouter();

  useEffect(() => {
    void group(libraries);

    // For initial loading
    void trackPageView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // For handling page change
  useEffect(() => {
    const handleRouteChange = () => {
      void trackPageView();
    };
    // When the component is mounted, subscribe to router changes
    // and log those page views
    router.events.on("routeChangeComplete", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]); // could be the bug with multiple page view being sent

  return;
};

export default useSMTracker;

function group(
  libs: readonly LibraryUI[]
): ReturnType<typeof telemetry.group> | void {
  const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

  return telemetry.group({
    manualLibsCount: libs.filter((l) => l.meta.isManual).length,
    downloadedLibsCount: downloadedLibs.length,
    npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
    downloadedLibs: downloadedLibs.map((l) =>
      l.meta.name != null ? l.meta.name : "Unknown"
    ),
  });
}

async function trackPageView(): ReturnType<typeof telemetry.track> {
  const adapter = await managerClient.project.getAdapterName();

  return telemetry.track({
    event: "page-view",
    url: window.location.href,
    path: window.location.pathname,
    search: window.location.search,
    title: document.title,
    referrer: document.referrer,
    adapter,
  });
}
