import Link from "next/link";
import React from "react";
import { Box, Text } from "theme-ui";

import { StatusBadge } from "@/features/changes/StatusBadge";
import { CUSTOM_TYPES_CONFIG } from "@/features/customTypes/customTypesConfig";
import { ModelsStatuses } from "@/features/sync/getUnSyncChanges";
import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";
import {
  hasLocal,
  LocalOrRemoteCustomType,
} from "@/legacy/lib/models/common/ModelData";
import { ModelStatus } from "@/legacy/lib/models/common/ModelStatus";
import { AuthStatus } from "@/modules/userContext/types";

interface CustomTypeTableProps {
  customTypes: LocalOrRemoteCustomType[];
  modelsStatuses: ModelsStatuses;
  authStatus: AuthStatus;
  isOnline: boolean;
}

const firstColumnWidth = "40%";
const secondColumnWidth = "40%";
const thirdColumnWidth = "20%";

const CustomTypeChangeRow: React.FC<{
  ct: CustomTypeSM;
  status: ModelStatus;
  authStatus: AuthStatus;
  isOnline: boolean;
}> = ({ ct, status, authStatus, isOnline }) => {
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
          authStatus={authStatus}
          isOnline={isOnline}
          modelStatus={status}
          modelType="CustomType"
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
              legacyBehavior
            >
              <tr
                tabIndex={0}
                data-testid={`custom-type-${customType.local.id}`}
              >
                <CustomTypeChangeRow
                  ct={customType.local}
                  status={modelsStatuses.customTypes[customType.local.id]}
                  authStatus={authStatus}
                  isOnline={isOnline}
                  key={customType.local.id}
                />
              </tr>
            </Link>
          ) : (
            <tr
              tabIndex={0}
              className="disabled"
              data-testid={`custom-type-${customType.remote.id}`}
              key={customType.remote.id}
            >
              <CustomTypeChangeRow
                ct={customType.remote}
                status={modelsStatuses.customTypes[customType.remote.id]}
                authStatus={authStatus}
                isOnline={isOnline}
                key={customType.remote.id}
              />
            </tr>
          ),
        )}
      </tbody>
    </Box>
  );
};
