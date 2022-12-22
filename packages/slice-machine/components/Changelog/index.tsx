import { Flex } from "theme-ui";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getChangelog, getPackageManager } from "@src/modules/environment";
import { useEffect, useState } from "react";
import { PackageVersion } from "@models/common/versions";
import { Navigation } from "./navigation";
import { VersionDetails, ReleaseWarning } from "./versionDetails";

export default function Changelog() {
  const { changelog, packageManager } = useSelector(
    (store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      packageManager: getPackageManager(store),
    })
  );

  const latestVersion = changelog.versions[0] || null;

  const [selectedVersion, setSelectedVersion] = useState<PackageVersion | null>(
    latestVersion
  );

  useEffect(() => {
    setSelectedVersion(latestVersion);
  }, [latestVersion]);

  return (
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
  );
}
