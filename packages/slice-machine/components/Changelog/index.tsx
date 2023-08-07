import { ProgressCircle } from "@prismicio/editor-ui";
import { BaseStyles, Flex } from "theme-ui";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getChangelog, getPackageManager } from "@src/modules/environment";
import { useEffect, useState } from "react";
import { PackageVersion } from "@models/common/versions";
import { Navigation } from "./navigation";
import { VersionDetails, ReleaseWarning } from "./versionDetails";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { AppLayout, AppLayoutContent } from "@components/AppLayout";

export default function Changelog() {
  const { changelog, packageManager, isChangelogLoading } = useSelector(
    (store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      packageManager: getPackageManager(store),
      isChangelogLoading: isLoading(store, LoadingKeysEnum.CHANGELOG),
    })
  );

  const latestVersion = changelog.sliceMachine.versions[0];

  const [selectedVersion, setSelectedVersion] = useState<
    PackageVersion | undefined
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  >(latestVersion || undefined);

  useEffect(() => {
    setSelectedVersion(latestVersion);
  }, [latestVersion]);

  const showReleaseWarning =
    changelog.sliceMachine.versions.length === 0 || !selectedVersion;

  return (
    <AppLayout>
      <AppLayoutContent>
        <BaseStyles sx={{ display: "flex", minWidth: 0 }}>
          {!isChangelogLoading ? (
            <>
              <Navigation
                changelog={changelog}
                selectedVersion={selectedVersion}
                selectVersion={(version) => setSelectedVersion(version)}
              />

              {showReleaseWarning ? (
                <Flex sx={{ paddingLeft: "32px" }}>
                  <ReleaseWarning />
                </Flex>
              ) : (
                <VersionDetails
                  changelog={changelog}
                  selectedVersion={selectedVersion}
                  packageManager={packageManager}
                />
              )}
            </>
          ) : (
            <ProgressCircle />
          )}
        </BaseStyles>
      </AppLayoutContent>
    </AppLayout>
  );
}
