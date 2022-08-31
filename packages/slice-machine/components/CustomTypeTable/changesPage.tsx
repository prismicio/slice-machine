import { StatusBadge } from "../StatusBadge";
import { FrontEndCustomType } from "@src/modules/availableCustomTypes/types";
import Link from "next/link";
import React from "react";
import { Box, Text } from "theme-ui";

export const CustomTypeTable: React.FC<{
  customTypes: FrontEndCustomType[];
}> = ({ customTypes }) => {
  const firstColumnWidth = "40%";
  const secondColumnWidth = "40%";
  const thirdColumnWidth = "20%";

  return (
    <Box as={"table"}>
      <thead>
        <tr className="transparent small">
          <Box as={"th"} sx={{ width: firstColumnWidth, fontWeight: 600 }}>
            Name
          </Box>
          <Box as={"th"} sx={{ width: secondColumnWidth, fontWeight: 600 }}>
            API ID
          </Box>
          <Box as={"th"} sx={{ width: thirdColumnWidth, fontWeight: 600 }}>
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
                <StatusBadge
                  models={customType}
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
