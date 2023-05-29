import React from "react";
import { Text } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Button } from "@components/Button";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isModalOpen } from "@src/modules/modal";
import { getModelId, hasLocal } from "@lib/models/common/ModelData";
import { CustomTypesReferencesCard } from "./AssociatedDocumentsCard";
import { ToasterType } from "@src/modules/toaster";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { SliceMachineDrawerUI } from "@components/SliceMachineDrawer";

export const ReferencesErrorDrawer: React.FunctionComponent<{
  pushChanges: (confirmDeleteDocuments: boolean) => void;
}> = ({ pushChanges }) => {
  const { isOpen, modalData, localCustomTypes } = useSelector(
    (store: SliceMachineStoreType) => ({
      isOpen: isModalOpen(store, ModalKeysEnum.REFERENCES_MISSING_DRAWER),
      localCustomTypes: selectAllCustomTypes(store).filter(hasLocal),
      modalData: store.pushChanges,
    })
  );
  const { closeModals, openToaster } = useSliceMachineActions();

  if (!isOpen) return null;

  if (modalData?.details === undefined) {
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
          format={customType.local.format}
          id={customType.local.id}
          name={customType.local.label ?? customType.local.id}
        />
      );
    }
  );

  return (
    <SliceMachineDrawerUI
      isOpen={isOpen}
      title={"Missing Slices"}
      footer={
        <>
          <Button
            label="Try again"
            variant="primary"
            onClick={() => {
              closeModals();
              pushChanges(false);
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
            You have{hasMoreThanOne ? "" : " a"} type
            {hasMoreThanOne ? "s" : ""} that reference{" "}
            {hasMoreThanOne ? "" : "s"} one or more missing Slices
          </Text>
          <Text sx={{ mb: 24 }}>
            Before pushing, remove references to any missing Slices by opening{" "}
            the affected type{hasMoreThanOne ? "s" : ""} and clicking the{" "}
            <b>Save</b> button.
          </Text>
          {associatedDocumentsCards}
        </>
      }
    />
  );
};
