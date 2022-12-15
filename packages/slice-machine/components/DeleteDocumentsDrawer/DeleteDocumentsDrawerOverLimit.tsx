import React from "react";

import Drawer from "rc-drawer";
import { Close, Flex, Heading, Text } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import Card from "@components/Card";
import { Button } from "@components/Button";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isModalOpen } from "@src/modules/modal";
import { AssociatedDocumentsCard } from "./AssociatedDocumentsCard";
import { sortDocumentCards } from ".";

// TODO: replace with actual API response
const AssociatedDocuments = [
  { ctName: "Feature", numberOfDocuments: 6, link: "https://prismic.io/" },
  { ctName: "Legals", numberOfDocuments: 2030, link: "https://prismic.io/" },
];

const DeleteDocumentsDrawerOverLimit: React.FunctionComponent = () => {
  const { isDeleteDocumentsDrawerOverLimitOpen } = useSelector(
    (store: SliceMachineStoreType) => ({
      isDeleteDocumentsDrawerOverLimitOpen: isModalOpen(
        store,
        ModalKeysEnum.DELETE_DOCUMENTS_DRAWER_OVER_LIMIT
      ),
    })
  );

  const { closeDeleteDocumentsDrawerOverLimit } = useSliceMachineActions();

  return (
    <Drawer
      placement="right"
      open={isDeleteDocumentsDrawerOverLimitOpen}
      level={null}
      onClose={closeDeleteDocumentsDrawerOverLimit}
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
                Manual action required
              </Heading>
            </Flex>
            <Close
              type="button"
              onClick={() => closeDeleteDocumentsDrawerOverLimit()}
            />
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
            <Button
              label="Try again"
              variant="primary"
              onClick={() => {
                console.log("Pushing");
              }}
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
          Your Custom Type{AssociatedDocuments.length > 1 && "s"} cannot be
          deleted.
        </Text>
        <Text sx={{ mb: 24 }}>
          {AssociatedDocuments.length > 1
            ? "These Custom Types have"
            : "This Custom Type has"}{" "}
          too many associated Documents. Archive and delete these Documents
          manually and then try deleting the Custom Types again.
        </Text>

        {sortDocumentCards(AssociatedDocuments).map((ctDocuments) => (
          <AssociatedDocumentsCard
            key={ctDocuments.ctName}
            ctDocuments={ctDocuments}
            isOverLimit
          />
        ))}
      </Card>
    </Drawer>
  );
};

export default DeleteDocumentsDrawerOverLimit;
