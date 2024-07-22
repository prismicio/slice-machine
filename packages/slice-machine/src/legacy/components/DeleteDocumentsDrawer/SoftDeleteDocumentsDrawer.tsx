import { PushChangesLimit } from "@slicemachine/manager";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Checkbox, Flex, Label, Text, ThemeUIStyleObject } from "theme-ui";

import { Button } from "@/legacy/components/Button";
import { SliceMachineDrawerUI } from "@/legacy/components/SliceMachineDrawer";
import { getModelId, isRemoteOnly } from "@/legacy/lib/models/common/ModelData";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";
import { SliceMachineStoreType } from "@/redux/type";

import { AssociatedDocumentsCard } from "./AssociatedDocumentsCard";

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
  modalData?: PushChangesLimit;
  onClose: () => void;
}> = ({ pushChanges, modalData, onClose }) => {
  const [confirmDeleteDocuments, setConfirmDeleteDocuments] = useState(false);

  const { remoteOnlyCustomTypes } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteOnlyCustomTypes: selectAllCustomTypes(store).filter(isRemoteOnly),
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (modalData?.type !== "SOFT") return null;

  const associatedDocumentsCards = modalData.details.customTypes.map(
    (customTypeDetail) => {
      const customType = remoteOnlyCustomTypes.find(
        (customType) => getModelId(customType) === customTypeDetail.id,
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
    },
  );

  return (
    <SliceMachineDrawerUI
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      isOpen={modalData.type === "SOFT"}
      title="Confirm deletion"
      onClose={onClose}
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
