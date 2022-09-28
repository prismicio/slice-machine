import { StatusBadge } from "../StatusBadge";
import Link from "next/link";
import React from "react";
import { Box, Text } from "theme-ui";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";
import { useModelStatus } from "@src/hooks/useModelStatus";

export const CustomTypeTable: React.FC<{
  customTypes: FrontEndCustomType[];
}> = ({ customTypes }) => {
  const { modelsStatuses, authStatus, isOnline } = useModelStatus(customTypes);

  const firstColumnWidth = "33%";
  const secondColumnWidth = "33%";
  const thirdColumnWidth = "17%";
  const fourthColumnWidth = "17%";

  return (
    <Box
      as={"table"}
      sx={{
        mt: "36px",
      }}
    >
      <thead>
        <tr>
          <Box as={"th"} sx={{ width: firstColumnWidth }}>
            Name
          </Box>
          <Box as={"th"} sx={{ width: secondColumnWidth }}>
            API ID
          </Box>
          <Box as={"th"} sx={{ width: thirdColumnWidth }}>
            Type
          </Box>
          <Box as={"th"} sx={{ width: fourthColumnWidth }}>
            Status
          </Box>
        </tr>
      </thead>
      <tbody>
        {customTypes.map((customType) => (
          <Link
            passHref
            href={`/cts/${customType.local.id}`}
            key={customType.local.id}
          >
            <tr tabIndex={0}>
              <Box as={"td"} style={{ width: firstColumnWidth }}>
                <Text sx={{ fontWeight: 500 }}>{customType.local.label}</Text>
              </Box>
              <Box as={"td"} style={{ width: secondColumnWidth }}>
                {customType.local.id}
              </Box>
              <Box as={"td"} style={{ width: thirdColumnWidth }}>
                {customType.local.repeatable
                  ? "Repeatable Type"
                  : "Single Type"}
              </Box>
              <Box as={"td"} style={{ width: fourthColumnWidth }}>
                <StatusBadge
                  modelType="Custom Type"
                  modelId={customType.local.id}
                  status={modelsStatuses.customTypes[customType.local.id]}
                  authStatus={authStatus}
                  isOnline={isOnline}
                  data-for={`${customType.local.id}-tooltip`}
                  data-tip
                />
              </Box>
            </tr>
          </Link>
        ))}
      </tbody>
    </Box>
  );
};
