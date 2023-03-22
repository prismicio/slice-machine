import { useEffect } from "react";

import { telemetry } from "@src/apiClient";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getFramework, getRepoName } from "@src/modules/environment";
import { getLibraries } from "@src/modules/slices";
import type { LibraryUI } from "@lib/models/common/LibraryUI";
import { useRouter } from "next/router";

const useSMTracker = () => {
  const { libraries, repoName, framework } = useSelector(
    (state: SliceMachineStoreType) => ({
      framework: getFramework(state),
      repoName: getRepoName(state),
      libraries: getLibraries(state),
    })
  );

  const router = useRouter();

  useEffect(() => {
    void group(libraries, repoName);

    // For initial loading
    void trackPageView(framework);
  }, []);

  // For handling page change
  useEffect(() => {
    const handleRouteChange = () => {
      void trackPageView(framework);
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

async function group(
  libs: readonly LibraryUI[],
  repositoryName: string | undefined
): ReturnType<typeof telemetry.group> {
  if (repositoryName === undefined) return;
  const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

  await telemetry.group({
    repositoryName,
    manualLibsCount: libs.filter((l) => l.meta.isManual).length,
    downloadedLibsCount: downloadedLibs.length,
    npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
    downloadedLibs: downloadedLibs.map((l) =>
      l.meta.name != null ? l.meta.name : "Unknown"
    ),
  });
}

function trackPageView(framework: string): ReturnType<typeof telemetry.track> {
  return telemetry.track({
    event: "page-view",
    url: window.location.href,
    path: window.location.pathname,
    search: window.location.search,
    title: document.title,
    referrer: document.referrer,
    framework,
  });
}
