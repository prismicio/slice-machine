import { Flex } from "theme-ui";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getChangelog } from "@src/modules/environment";
import { useState } from "react";
import { PackageVersion } from "@models/common/versions";
import { Navigation } from "./navigation";

export default function Changelog() {
  const { changelog } = useSelector((store: SliceMachineStoreType) => ({
    changelog: getChangelog(store),
  }));

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

      <Flex>{selectedVersion?.versionNumber}</Flex>
    </Flex>
  );
}
