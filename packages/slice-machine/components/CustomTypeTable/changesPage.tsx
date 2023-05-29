import { StatusBadge } from "../StatusBadge";
import Link from "next/link";
import React from "react";
import { Box, Text } from "theme-ui";
import { ModelStatusInformation } from "@src/hooks/useModelStatus";
import { CustomTypeSM } from "@lib/models/common/CustomType";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import {
  LocalOrRemoteCustomType,
  hasLocal,
} from "@lib/models/common/ModelData";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";

interface CustomTypeTableProps extends ModelStatusInformation {
  customTypes: LocalOrRemoteCustomType[];
}

const firstColumnWidth = "40%";
const secondColumnWidth = "40%";
const thirdColumnWidth = "20%";

const CustomTypeChangeRow: React.FC<
  { ct: CustomTypeSM; status: ModelStatus } & ModelStatusInformation
> = ({ ct, status, authStatus, isOnline }) => {
  return (
    <>
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
    </>
  );
};

export const CustomTypeTable: React.FC<CustomTypeTableProps> = ({
  customTypes,
  modelsStatuses,
  authStatus,
  isOnline,
}) => {
  return (
    <Box as={"table"} data-legacy-component>
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
          hasLocal(customType) ? (
            <Link
              passHref
              href={CUSTOM_TYPES_CONFIG[
                customType.local.format
              ].getBuilderPagePathname(customType.local.id)}
              key={customType.local.id}
            >
              <tr tabIndex={0}>
                <CustomTypeChangeRow
                  ct={customType.local}
                  status={modelsStatuses.customTypes[customType.local.id]}
                  authStatus={authStatus}
                  isOnline={isOnline}
                  modelsStatuses={modelsStatuses}
                  key={customType.local.id}
                />
              </tr>
            </Link>
          ) : (
            <tr tabIndex={0} className="disabled">
              <CustomTypeChangeRow
                ct={customType.remote}
                status={modelsStatuses.customTypes[customType.remote.id]}
                authStatus={authStatus}
                isOnline={isOnline}
                modelsStatuses={modelsStatuses}
                key={customType.remote.id}
              />
            </tr>
          )
        )}
      </tbody>
    </Box>
  );
};
