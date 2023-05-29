import React, { useState } from "react";
import { Flex, Text, Checkbox, ThemeUIStyleObject, Label } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Button } from "@components/Button";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isModalOpen } from "@src/modules/modal";
import { isRemoteOnly } from "@lib/models/common/ModelData";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { ToasterType } from "@src/modules/toaster";
import { getModelId } from "@lib/models/common/ModelData";
import { AssociatedDocumentsCard } from "./AssociatedDocumentsCard";
import { SliceMachineDrawerUI } from "@components/SliceMachineDrawer";

const ConfirmationDialogue: React.FC<{
  isConfirmed: boolean;
  onToggle: () => void;
  sx?: ThemeUIStyleObject;
}> = ({ onToggle, isConfirmed, sx }) => (
  <Flex
    sx={{
      borderRadius: 6,
      flexDirection: "column",
      backgroundColor: "grey03",
      padding: 12,
      width: "100%",
      ...sx,
    }}
  >
    <Text sx={{ fontWeight: "bold", mb: 2 }}>Are you sure to proceed?</Text>

    <Label sx={{ mt: "4px", py: 1 }} variant={"large"}>
      <Checkbox
        defaultChecked={isConfirmed}
        onChange={onToggle}
        variant="forms.checkbox.dark"
      />
      Delete these Documents
    </Label>
  </Flex>
);

export const SoftDeleteDocumentsDrawer: React.FunctionComponent<{
  pushChanges: (confirmDeleteDocuments: boolean) => void;
}> = ({ pushChanges }) => {
  const [confirmDeleteDocuments, setConfirmDeleteDocuments] = useState(false);

  const { isDeleteDocumentsDrawerOpen, remoteOnlyCustomTypes, modalData } =
    useSelector((store: SliceMachineStoreType) => ({
      isDeleteDocumentsDrawerOpen: isModalOpen(
        store,
        ModalKeysEnum.SOFT_DELETE_DOCUMENTS_DRAWER
      ),
      remoteOnlyCustomTypes: selectAllCustomTypes(store).filter(isRemoteOnly),
      modalData: store.pushChanges,
    }));

  const { closeModals, openToaster } = useSliceMachineActions();

  if (!isDeleteDocumentsDrawerOpen) return null;

  if (modalData?.type !== "SOFT") {
    openToaster("No change data", ToasterType.ERROR);
    return null;
  }

  const associatedDocumentsCards = modalData.details.customTypes.map(
    (customTypeDetail) => {
      const customType = remoteOnlyCustomTypes.find(
        (customType) => getModelId(customType) === customTypeDetail.id
      );
      if (customType === undefined) return null;

      return (
        <AssociatedDocumentsCard
          isOverLimit
          key={customTypeDetail.id}
          ctName={customType.remote.label ?? customType.remote.id}
          link={customTypeDetail.url}
          numberOfDocuments={customTypeDetail.numberOfDocuments}
        />
      );
    }
  );

  return (
    <SliceMachineDrawerUI
      isOpen={isDeleteDocumentsDrawerOpen}
      title="Confirm deletion"
      footer={
        <>
          <ConfirmationDialogue
            onToggle={() => {
              setConfirmDeleteDocuments(!confirmDeleteDocuments);
            }}
            isConfirmed={confirmDeleteDocuments}
            sx={{ mb: 10 }}
          />
          <Button
            label="Push changes"
            variant="primary"
            onClick={() => {
              closeModals();
              pushChanges(confirmDeleteDocuments);
            }}
            disabled={!confirmDeleteDocuments}
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
            This action will also delete Documents.
          </Text>
          <Text sx={{ mb: 24 }}>
            {modalData.details.customTypes.length > 1
              ? "These types have"
              : "This type has"}{" "}
            associated Documents, which will also be deleted. This might create
            broken links in your repository.
          </Text>
          {associatedDocumentsCards}
        </>
      }
    />
  );
};
