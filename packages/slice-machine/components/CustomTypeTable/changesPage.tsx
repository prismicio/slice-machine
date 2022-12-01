import { StatusBadge } from "../StatusBadge";
import {
  FrontEndCustomType,
  isLocalCustomType,
} from "@src/modules/availableCustomTypes/types";
import Link from "next/link";
import React from "react";
import { Box, Text } from "theme-ui";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { ModelStatus } from "@lib/models/common/ModelStatus";

interface CustomTypeTableProps extends ModelStatusInformation {
  customTypes: FrontEndCustomType[];
}

const firstColumnWidth = "40%";
const secondColumnWidth = "40%";
const thirdColumnWidth = "20%";

// Forward ref is required to be used with Link
const CustomTypeChangeRow: React.FC<
  { ct: CustomTypeSM; status: ModelStatus } & ModelStatusInformation
> = React.forwardRef(({ ct, status, authStatus, isOnline }, _ref) => (
  <tr
    tabIndex={0}
    className={status === ModelStatus.Deleted ? "disabled" : undefined}
  >
    <Box as={"td"} style={{ width: firstColumnWidth }}>
      <Text sx={{ fontWeight: 500 }}>{ct.label}</Text>
    </Box>
    <Box as={"td"} style={{ width: secondColumnWidth }}>
      {ct.id}
    </Box>
    <Box as={"td"} style={{ width: thirdColumnWidth }}>
      <StatusBadge
        modelType="Custom Type"
        modelId={ct.id}
        status={status}
        authStatus={authStatus}
        isOnline={isOnline}
        data-for={`${ct.id}-tooltip`}
        data-tip
      />
    </Box>
  </tr>
));

export const CustomTypeTable: React.FC<CustomTypeTableProps> = ({
  customTypes,
  modelsStatuses,
  authStatus,
  isOnline,
}) => {
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
        {customTypes.map((customType) =>
          isLocalCustomType(customType) ? (
            <Link
              passHref
              href={`/cts/${customType.local.id}`}
              key={customType.local.id}
            >
              <CustomTypeChangeRow
                ct={customType.local}
                status={modelsStatuses.customTypes[customType.local.id]}
                authStatus={authStatus}
                isOnline={isOnline}
                modelsStatuses={modelsStatuses}
              />
            </Link>
          ) : (
            <CustomTypeChangeRow
              ct={customType.remote}
              status={modelsStatuses.customTypes[customType.remote.id]}
              authStatus={authStatus}
              isOnline={isOnline}
              modelsStatuses={modelsStatuses}
              key={customType.remote.id}
            />
          )
        )}
      </tbody>
    </Box>
  );
};
