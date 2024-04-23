import { ErrorBoundary, ProgressCircle } from "@prismicio/editor-ui";
import { Version } from "@slicemachine/manager";
import { Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BaseStyles } from "theme-ui";

import { useSliceMachineVersions } from "@/features/changelog/useSliceMachineVersions";
import { AppLayout, AppLayoutContent } from "@/legacy/components/AppLayout";
import { getPackageManager } from "@/modules/environment";
import { SliceMachineStoreType } from "@/redux/type";

import { Navigation } from "./navigation";
import { ReleaseWarning, VersionDetails } from "./versionDetails";

export default function Changelog() {
  const { packageManager } = useSelector((store: SliceMachineStoreType) => ({
    packageManager: getPackageManager(store),
  }));
  const versions = useSliceMachineVersions();
  const latestVersion = versions[0];

  const [selectedVersion, setSelectedVersion] = useState<Version | undefined>(
    latestVersion ?? undefined,
  );

  useEffect(() => {
    setSelectedVersion(latestVersion);
  }, [latestVersion]);

  const showReleaseWarning = versions.length === 0 || !selectedVersion;

  return (
    <AppLayout>
      <AppLayoutContent>
        <BaseStyles sx={{ display: "flex", minWidth: 0 }}>
          <Navigation
            selectedVersion={selectedVersion}
            selectVersion={(version) => setSelectedVersion(version)}
          />

          {showReleaseWarning ? (
            <ReleaseWarning />
          ) : (
            <ErrorBoundary renderError={() => <ReleaseWarning />}>
              <Suspense fallback={<ProgressCircle />}>
                <VersionDetails
                  selectedVersion={selectedVersion}
                  packageManager={packageManager}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </BaseStyles>
      </AppLayoutContent>
    </AppLayout>
  );
}
