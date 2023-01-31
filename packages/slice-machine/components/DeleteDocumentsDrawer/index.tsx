import React, { useState } from "react";

import Drawer from "rc-drawer";
import {
  Close,
  Flex,
  Heading,
  Text,
  Checkbox,
  ThemeUIStyleObject,
  Label,
} from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import Card from "@components/Card";
import { Button } from "@components/Button";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isModalOpen } from "@src/modules/modal";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { AssociatedDocumentsCard } from "./AssociatedDocumentsCard";
import {
  getModelId,
  hasLocal,
  LocalOrRemoteCustomType,
} from "@lib/models/common/ModelData";

export function getCTName(ct: LocalOrRemoteCustomType | undefined): string {
  if (ct === undefined) {
    return "Could not find Custom Type";
  }

  return (hasLocal(ct) ? ct.local.label : ct.remote.label) ?? 'John "CT" Doe';
}

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

const DeleteDocumentsDrawer: React.FunctionComponent = () => {
  const { isDeleteDocumentsDrawerOpen, availableCustomTypes, modalData } =
    useSelector((store: SliceMachineStoreType) => ({
      isDeleteDocumentsDrawerOpen: isModalOpen(
        store,
        ModalKeysEnum.DELETE_DOCUMENTS_DRAWER
      ),
      availableCustomTypes: selectAllCustomTypes(store),
      modalData: store.pushChanges,
    }));

  const { pushChanges, closeModals } = useSliceMachineActions();

  const [hasConfirmed, setHasConfirmed] = useState(false);

  // TODO: sort out this silent error
  if (!modalData?.details.customTypes) return null;

  return (
    <Drawer
      placement="right"
      open={isDeleteDocumentsDrawerOpen}
      level={null}
      onClose={closeModals}
      width={496}
    >
      <Card
        radius={"0px"}
        bodySx={{
          bg: "white",
          padding: 24,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "scroll",
        }}
        footerSx={{
          p: 0,
        }}
        sx={{
          flexDirection: "column",
          display: "flex",
          height: "100%",
          border: "none",
        }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Flex sx={{ alignItems: "center" }}>
              <Heading sx={{ fontSize: "14px", fontWeight: "bold", ml: 1 }}>
                Confirm deletion
              </Heading>
            </Flex>
            <Close type="button" onClick={() => closeModals()} />
          </Flex>
        )}
        Footer={() => (
          <Flex
            sx={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingRight: 16,
              borderTop: (t) => `1px solid ${String(t.colors?.darkBorders)}`,
              backgroundColor: "white",
              padding: 20,
            }}
          >
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
                pushChanges(true);
              }}
              disabled={!hasConfirmed}
              sx={{
                fontWeight: "bold",
                color: "white",
                borderRadius: 6,
                width: "100%",
              }}
            />
          </Flex>
        )}
      >
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

        {modalData.details.customTypes.map((ct) => (
          <AssociatedDocumentsCard
            key={ct.id}
            ctName={getCTName(
              availableCustomTypes.find(
                (ctInArray) => getModelId(ctInArray) === ct.id
              )
            )}
            link={ct.url}
            numberOfDocuments={ct.numberOfDocuments}
          />
        ))}
      </Card>
    </Drawer>
  );
};

export default DeleteDocumentsDrawer;
