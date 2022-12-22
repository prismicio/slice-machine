import { Flex } from "theme-ui";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getChangelog, getPackageManager } from "@src/modules/environment";
import { useEffect, useState } from "react";
import { PackageVersion } from "@models/common/versions";
import { Navigation } from "./navigation";
import { VersionDetails, ReleaseWarning } from "./versionDetails";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import LoadingPage from "@components/LoadingPage";

export default function Changelog() {
  const { changelog, packageManager, isChangelogLoading } = useSelector(
    (store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      packageManager: getPackageManager(store),
      isChangelogLoading: isLoading(store, LoadingKeysEnum.CHANGELOG),
    })
  );

  const latestVersion = changelog.versions[0];

  const [selectedVersion, setSelectedVersion] = useState<PackageVersion | null>(
    latestVersion || null
  );

  useEffect(() => {
    setSelectedVersion(latestVersion);
  }, [latestVersion]);

  return !isChangelogLoading ? (
    <Flex
      sx={{
        maxWidth: "1224px",
      }}
    >
      <Navigation
        changelog={changelog}
        selectedVersion={selectedVersion}
        selectVersion={(version) => setSelectedVersion(version)}
      />

      {changelog.versions.length === 0 || !selectedVersion ? (
        <Flex
          sx={{
            width: "650px",
            minWidth: "650px",
            height: "100%",
            borderRight: "1px solid",
            borderColor: "grey01",
            flexDirection: "column",
            padding: "24px 32px",
            gap: "24px",
          }}
        >
          <ReleaseWarning />
        </Flex>
      ) : (
        <VersionDetails
          changelog={changelog}
          selectedVersion={selectedVersion}
          packageManager={packageManager}
        />
      )}
    </Flex>
  ) : (
    <LoadingPage />
  );
}
