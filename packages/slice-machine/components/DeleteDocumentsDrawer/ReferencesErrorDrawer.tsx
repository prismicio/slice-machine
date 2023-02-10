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
import { CustomTypesReferencesCard } from "./AssociatedDocumentsCard";
import { ToasterType } from "@src/modules/toaster";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";

export const ReferencesErrorDrawer: React.FunctionComponent = () => {
  const { isOpen, modalData, localCustomTypes } = useSelector(
    (store: SliceMachineStoreType) => ({
      isOpen: isModalOpen(store, ModalKeysEnum.REFERENCES_MISSING_DRAWER),
      localCustomTypes: selectAllCustomTypes(store).filter(hasLocal),
      modalData: store.pushChanges,
    })
  );
  const { pushChanges, closeModals, openToaster } = useSliceMachineActions();

  if (!isOpen) return null;

  if (!modalData?.details.customTypes) {
    openToaster("No change data", ToasterType.ERROR);
    return null;
  }

  const hasMoreThanOne = modalData?.details.customTypes.length > 1;

  const associatedDocumentsCards = modalData.details.customTypes.map(
    (customTypeDetail) => {
      const customType = localCustomTypes.find(
        (customType) => getModelId(customType) === customTypeDetail.id
      );
      if (customType === undefined) return null;

      return (
        <CustomTypesReferencesCard
          name={customType.local.label ?? customType.local.id}
        />
      );
    }
  );

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
              pushChanges();
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
          {associatedDocumentsCards}
        </>
      }
    />
  );
};
