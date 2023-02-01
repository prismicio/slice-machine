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
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { getModelId } from "@lib/models/common/ModelData";
import { getCTName } from ".";
import { ToasterType } from "@src/modules/toaster";

const DeleteDocumentsDrawerOverLimit: React.FunctionComponent = () => {
  const {
    isDeleteDocumentsDrawerOverLimitOpen,
    availableCustomTypes,
    modalData,
  } = useSelector((store: SliceMachineStoreType) => ({
    isDeleteDocumentsDrawerOverLimitOpen: isModalOpen(
      store,
      ModalKeysEnum.DELETE_DOCUMENTS_DRAWER_OVER_LIMIT
    ),
    availableCustomTypes: selectAllCustomTypes(store),
    modalData: store.pushChanges,
  }));

  const { pushChanges, closeModals, openToaster } = useSliceMachineActions();

  if (!isDeleteDocumentsDrawerOverLimitOpen) return null;

  if (!modalData?.details.customTypes) {
    openToaster("No change data", ToasterType.ERROR);
    return null;
  }

  return (
    <Drawer
      placement="right"
      open={isDeleteDocumentsDrawerOverLimitOpen}
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
                Manual action required
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
            <Button
              label="Try again"
              variant="primary"
              onClick={() => {
                closeModals();
                pushChanges(); // TODO: should this confirm deletion? Otherwise we get the other modal
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
          Your Custom Type{modalData.details.customTypes.length > 1 && "s"}{" "}
          cannot be deleted.
        </Text>
        <Text sx={{ mb: 24 }}>
          {modalData.details.customTypes.length > 1
            ? "These Custom Types have"
            : "This Custom Type has"}{" "}
          too many associated Documents. Archive and delete these Documents
          manually and then try deleting the Custom Types again.
        </Text>

        {modalData.details.customTypes.map((ct) => (
          <AssociatedDocumentsCard
            key={ct.id}
            isOverLimit
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

export default DeleteDocumentsDrawerOverLimit;
