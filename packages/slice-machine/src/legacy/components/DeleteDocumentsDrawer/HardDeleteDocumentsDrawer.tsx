import { PushChangesLimit } from "@slicemachine/manager";
import React from "react";
import { useSelector } from "react-redux";
import { Text } from "theme-ui";

import { Button } from "@/legacy/components/Button";
import { SliceMachineDrawerUI } from "@/legacy/components/SliceMachineDrawer";
import { getModelId, isRemoteOnly } from "@/legacy/lib/models/common/ModelData";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";
import { SliceMachineStoreType } from "@/redux/type";

import { AssociatedDocumentsCard } from "./AssociatedDocumentsCard";

export const HardDeleteDocumentsDrawer: React.FunctionComponent<{
  pushChanges: (confirmDeleteDocuments: boolean) => void;
  modalData?: PushChangesLimit;
  onClose: () => void;
}> = ({ pushChanges, modalData, onClose }) => {
  const { remoteOnlyCustomTypes } = useSelector(
    (store: SliceMachineStoreType) => ({
      remoteOnlyCustomTypes: selectAllCustomTypes(store).filter(isRemoteOnly),
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  if (modalData?.type !== "HARD") return null;

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
      isOpen={modalData.type === "HARD"}
      title="Manual action required"
      onClose={onClose}
      footer={
        <Button
          label="Try again"
          variant="primary"
          onClick={() => {
            pushChanges(false);
          }}
          sx={{
            fontWeight: "bold",
            color: "white",
            borderRadius: 6,
            width: "100%",
          }}
        />
      }
      explanations={
        <>
          <Text sx={{ fontWeight: "bold", mb: 1, lineHeight: "24px" }}>
            Your type{modalData.details.customTypes.length > 1 && "s"} cannot be
            deleted.
          </Text>
          <Text sx={{ mb: 24 }}>
            {modalData.details.customTypes.length > 1
              ? "These types have"
              : "This type has"}{" "}
            too many associated Documents. Archive and delete these Documents
            manually and then try deleting the types again.
          </Text>
          {associatedDocumentsCards}
        </>
      }
    />
  );
};
