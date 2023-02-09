import React, { useState } from "react";
import { Flex, Text, Checkbox, ThemeUIStyleObject, Label } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Button } from "@components/Button";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isModalOpen } from "@src/modules/modal";
import { CommonDeleteDocumentsDrawer } from "./CommonDeleteDocumentsDrawer";
import { isRemoteOnly } from "@lib/models/common/ModelData";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { ToasterType } from "@src/modules/toaster";

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

export const SoftDeleteDocumentsDrawer: React.FunctionComponent = () => {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const { isDeleteDocumentsDrawerOpen, remoteOnlyCustomTypes, modalData } =
    useSelector((store: SliceMachineStoreType) => ({
      isDeleteDocumentsDrawerOpen: isModalOpen(
        store,
        ModalKeysEnum.DELETE_DOCUMENTS_DRAWER
      ),
      remoteOnlyCustomTypes: selectAllCustomTypes(store).filter(isRemoteOnly),
      modalData: store.pushChanges,
    }));

  const { pushChanges, closeModals, openToaster } = useSliceMachineActions();

  if (!modalData?.details.customTypes) {
    openToaster("No change data", ToasterType.ERROR);
    return null;
  }

  return (
    <CommonDeleteDocumentsDrawer
      modalData={modalData}
      remoteOnlyCustomTypes={remoteOnlyCustomTypes}
      isOpen={isDeleteDocumentsDrawerOpen}
      isOverLimit={false}
      title="Confirm deletion"
      footer={
        <>
          <ConfirmationDialogue
            onToggle={() => {
              setHasConfirmed(!hasConfirmed);
            }}
            isConfirmed={hasConfirmed}
            sx={{ mb: 10 }}
          />
          <Button
            label="Push changes"
            variant="primary"
            onClick={() => {
              closeModals();
              pushChanges(hasConfirmed);
            }}
            disabled={!hasConfirmed}
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
              ? "These Custom Types have"
              : "This Custom Type has"}{" "}
            associated Documents, which will also be deleted. This might create
            broken links in your repository.
          </Text>
        </>
      }
    />
  );
};
