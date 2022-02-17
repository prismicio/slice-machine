import { Flex } from "theme-ui";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getChangelog, getPackageManager } from "@src/modules/environment";
import { useState } from "react";
import { PackageVersion } from "@models/common/versions";
import { Navigation } from "./navigation";
import { VersionDetails } from "./versionDetails";

export default function Changelog() {
  const { changelog, packageManager } = useSelector(
    (store: SliceMachineStoreType) => ({
      changelog: getChangelog(store),
      packageManager: getPackageManager(store),
    })
  );

  // Null is when no version are found (edge case)
  const [selectedVersion, setSelectedVersion] = useState<PackageVersion | null>(
    changelog.versions[0] || null
  );

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

      {changelog.versions.length === 0 || !selectedVersion.releaseNote ? (
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
          <div>
            Could not fetch release notes.{" "}
            <a
              href="https://github.com/prismicio/slice-machine/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find out more on GitHub
            </a>
          </div>
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
