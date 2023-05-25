import { StatusBadge } from "../StatusBadge";
import Link from "next/link";
import React, { useState } from "react";
import { Box, Text } from "theme-ui";
import { useModelStatus } from "@src/hooks/useModelStatus";
import { KebabMenuDropdown } from "@components/KebabMenuDropdown";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { RenameCustomTypeModal } from "@components/Forms/RenameCustomTypeModal";
import { DeleteCustomTypeModal } from "@components/DeleteCTModal";
import {
  LocalAndRemoteCustomType,
  LocalOnlyCustomType,
} from "@lib/models/common/ModelData";
import { CustomTypes } from "@lib/models/common/CustomType";

export const CustomTypeTable: React.FC<{
  customTypes: (LocalOnlyCustomType | LocalAndRemoteCustomType)[];
}> = ({ customTypes }) => {
  const { modelsStatuses, authStatus, isOnline } = useModelStatus({
    customTypes,
  });
  const [customTypeToEdit, setCustomTypeToEdit] = useState<
    LocalAndRemoteCustomType | LocalOnlyCustomType
  >();

  const firstColumnWidth = "27%";
  const secondColumnWidth = "27%";
  const thirdColumnWidth = "20%";
  const fourthColumnWidth = "20%";
  const fifthColumnWidth = "6%";

  const { openRenameCustomTypeModal, openDeleteCustomTypeModal } =
    useSliceMachineActions();

  return (
    <>
      <Box
        as={"table"}
        data-legacy-component
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
            <Box as={"th"} sx={{ width: fifthColumnWidth }} />
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
                  <Text
                    sx={{ fontWeight: 500 }}
                    data-cy={`custom-type-${customType.local.id}-label`}
                  >
                    {customType.local.label}
                  </Text>
                </Box>
                <Box as={"td"} style={{ width: secondColumnWidth }}>
                  {customType.local.id}
                </Box>
                <Box as={"td"} style={{ width: thirdColumnWidth }}>
                  {customType.local.repeatable
                    ? "Reusable Type"
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
                <Box as={"td"} style={{ width: fifthColumnWidth }}>
                  <KebabMenuDropdown
                    dataCy="edit-custom-type-menu"
                    menuOptions={[
                      {
                        displayName: "Rename",
                        onClick: () => {
                          setCustomTypeToEdit(customType);
                          openRenameCustomTypeModal();
                        },
                        dataCy: "ct-rename-menu-option",
                      },
                      {
                        displayName: "Delete",
                        onClick: () => {
                          setCustomTypeToEdit(customType);
                          openDeleteCustomTypeModal();
                        },
                      },
                    ]}
                  />
                </Box>
              </tr>
            </Link>
          ))}
        </tbody>
      </Box>
      <RenameCustomTypeModal
        customType={
          customTypeToEdit
            ? CustomTypes.fromSM(customTypeToEdit.local)
            : undefined
        }
      />
      <DeleteCustomTypeModal
        customType={
          customTypeToEdit
            ? CustomTypes.fromSM(customTypeToEdit.local)
            : undefined
        }
      />
    </>
  );
};
