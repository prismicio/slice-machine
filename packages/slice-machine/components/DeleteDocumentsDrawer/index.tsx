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
import {
  AssociatedDocumentsCard,
  CustomtypeDocuments,
} from "./AssociatedDocumentsCard";

export const sortDocumentCards = (
  documents: Readonly<Array<CustomtypeDocuments>>
) =>
  [...documents].sort(
    (doc1, doc2) => doc2.numberOfDocuments - doc1.numberOfDocuments
  );

// TODO: replace with actual API response
const AssociatedDocuments = [
  { ctName: "Legals1", numberOfDocuments: 23, link: "https://prismic.io/" },
  { ctName: "Features1", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features2", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features3", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features4", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features5", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features6", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Legals2", numberOfDocuments: 23, link: "https://prismic.io/" },
  { ctName: "Features7", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features8", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features9", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features10", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features11", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Features12", numberOfDocuments: 6, link: "https://prismic.io/" },
];

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
  const { isDeleteDocumentsDrawerOpen } = useSelector(
    (store: SliceMachineStoreType) => ({
      isDeleteDocumentsDrawerOpen: isModalOpen(
        store,
        ModalKeysEnum.DELETE_DOCUMENTS_DRAWER
      ),
    })
  );

  const { closeDeleteDocumentsDrawer } = useSliceMachineActions();

  const [hasConfirmed, setHasConfirmed] = useState(false);

  return (
    <Drawer
      placement="right"
      open={isDeleteDocumentsDrawerOpen}
      level={null}
      onClose={closeDeleteDocumentsDrawer}
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
            <Close type="button" onClick={() => closeDeleteDocumentsDrawer()} />
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
                console.log("Pushing");
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
          {AssociatedDocuments.length > 1
            ? "These Custom Types have"
            : "This Custom Type has"}{" "}
          associated Documents, which will also be deleted. This might create
          broken links in your repository.
        </Text>

        {sortDocumentCards(AssociatedDocuments).map((ctDocuments) => (
          <AssociatedDocumentsCard
            key={ctDocuments.ctName}
            ctDocuments={ctDocuments}
          />
        ))}
      </Card>
    </Drawer>
  );
};

export default DeleteDocumentsDrawer;
