import type { FC } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { Close, Flex, Heading, useThemeUI } from "theme-ui";

import { Button } from "@components/Button";
import Card from "@components/Card";
import SliceMachineModal from "@components/SliceMachineModal";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import type { SliceMachineStoreType } from "@src/redux/type";

type DeleteVariationModalProps = {
  variationID: string;
};

export const DeleteVariationModal: FC<DeleteVariationModalProps> = () => {
  const { closeModals } = useSliceMachineActions();
  const isOpen = useSelector((store: SliceMachineStoreType) =>
    isModalOpen(store, ModalKeysEnum.DELETE_VARIATION),
  );
  const { theme } = useThemeUI();

  return (
    <SliceMachineModal
      isOpen={isOpen}
      onRequestClose={closeModals}
      shouldCloseOnOverlayClick={true}
      style={{ content: { maxWidth: 612 } }}
    >
      <Card
        bodySx={{
          p: 0,
          bg: "white",
          position: "relative",
          height: "100%",
          padding: 16,
        }}
        footerSx={{
          position: "sticky",
          bottom: 0,
          p: 0,
        }}
        sx={{ border: "none" }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              position: "sticky",
              background: "gray",
              top: 0,
              zIndex: 1,
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Flex sx={{ alignItems: "center" }}>
              <MdOutlineDelete
                size={20}
                color={theme.colors?.greyIcon as string}
              />
              <Heading sx={{ fontSize: "14px", fontWeight: "bold", ml: 1 }}>
                Delete Variation
              </Heading>
            </Flex>
            <Close type="button" onClick={closeModals} />
          </Flex>
        )}
        Footer={() => (
          <Flex
            sx={{
              justifyContent: "flex-end",
              height: 64,
              alignItems: "center",
              paddingRight: 16,
              borderTop: (t) => `1px solid ${String(t.colors?.darkBorders)}`,
              backgroundColor: "gray",
            }}
          >
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => closeModals()}
              sx={{
                mr: "10px",
                fontWeight: "bold",
                color: "grey12",
                borderRadius: 6,
              }}
            />
            <Button
              label="Delete"
              variant="danger"
              sx={{ minHeight: 39, minWidth: 78 }}
            />
          </Flex>
        )}
      ></Card>
    </SliceMachineModal>
  );
};
