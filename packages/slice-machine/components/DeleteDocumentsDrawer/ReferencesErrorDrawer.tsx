import React from "react";
import { Text } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Button } from "@components/Button";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isModalOpen } from "@src/modules/modal";
import { CommonDeleteDocumentsDrawer } from "./CommonDeleteDocumentsDrawer";
import { getModelId, hasLocal } from "@lib/models/common/ModelData";
import { useUnSyncChanges } from "@src/hooks/useUnSyncChanges";
import { CustomTypesReferencesCard } from "./AssociatedDocumentsCard";

export const ReferencesErrorDrawer: React.FunctionComponent = () => {
  const { isOpen } = useSelector((store: SliceMachineStoreType) => ({
    isOpen: isModalOpen(store, ModalKeysEnum.REFERENCES_MISSING_DRAWER),
  }));
  const { customTypesWithError } = useUnSyncChanges();

  const { pushChanges, closeModals } = useSliceMachineActions();

  const hasMoreThanOne = customTypesWithError.length > 1;

  return (
    <CommonDeleteDocumentsDrawer
      isOpen={isOpen}
      title={`Reference${hasMoreThanOne ? "s" : ""} to missing Slices`}
      footer={
        <>
          <Button
            label="Try again"
            variant="primary"
            onClick={() => {
              closeModals();
              pushChanges({
                customTypesWithError,
              });
            }}
            sx={{
              fontWeight: "bold",
              color: "white",
              borderRadius: 6,
              width: "100%",
            }}
          />
        </>
      }
      explanations={
        <>
          <Text sx={{ fontWeight: "bold", mb: 1, lineHeight: "24px" }}>
            You have Custom Type{hasMoreThanOne ? "s" : ""} with reference
            {hasMoreThanOne ? "s" : ""} to missing Slices
          </Text>
          <Text sx={{ mb: 24 }}>
            In order to continue pushing, you need to unreference the deleted
            Slices in the following Custom Type{hasMoreThanOne ? "s" : ""}:
          </Text>
          {customTypesWithError.map((ct) => (
            <CustomTypesReferencesCard
              name={
                (hasLocal(ct) ? ct.local.label : ct.remote.label) ??
                getModelId(ct)
              }
            />
          ))}
        </>
      }
    />
  );
};
