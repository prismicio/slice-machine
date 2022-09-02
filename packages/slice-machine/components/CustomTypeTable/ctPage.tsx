import { StatusBadgeWithTooltip } from "../Badge/StatusBadgeWithTooltip";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import Link from "next/link";
import React from "react";
import { Box, Text } from "theme-ui";

export const CustomTypeTable: React.FC<{
  customTypes: CustomTypeSM[];
}> = ({ customTypes }) => {
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
          <Link passHref href={`/cts/${customType.id}`} key={customType.id}>
            <tr tabIndex={0}>
              <Box as={"td"} style={{ width: firstColumnWidth }}>
                <Text sx={{ fontWeight: 500 }}>{customType.label}</Text>
              </Box>
              <Box as={"td"} style={{ width: secondColumnWidth }}>
                {customType.id}
              </Box>
              <Box as={"td"} style={{ width: thirdColumnWidth }}>
                {customType.repeatable ? "Repeatable Type" : "Single Type"}
              </Box>
              <Box as={"td"} style={{ width: fourthColumnWidth }}>
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
