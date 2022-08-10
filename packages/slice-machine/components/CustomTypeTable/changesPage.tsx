import { StatusBadgeWithTooltip } from "../Badge/StatusBadgeWithTooltip";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import Link from "next/link";
import React from "react";
import { Box } from "theme-ui";

export const CustomTypeTable: React.FC<{
  customTypes: ReadonlyArray<CustomTypeSM>;
}> = ({ customTypes }) => {
  const firstColumnWidth = "40%";
  const secondColumnWidth = "40%";
  const thirdColumnWidth = "20%";

  return (
    <Box as={"table"}>
      <tbody>
        {customTypes.map((customType) => (
          <Link passHref href={`/cts/${customType.id}`} key={customType.id}>
            <tr tabIndex={0}>
              <Box as={"td"} style={{ width: firstColumnWidth }}>
                {customType.label}
              </Box>
              <Box as={"td"} style={{ width: secondColumnWidth }}>
                {customType.id}
              </Box>
              <Box
                as={"td"}
                style={{ width: thirdColumnWidth, textAlign: "right" }}
              >
                <StatusBadgeWithTooltip
                  customType={customType}
                  data-for={`${customType.id}-tooltip`}
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
