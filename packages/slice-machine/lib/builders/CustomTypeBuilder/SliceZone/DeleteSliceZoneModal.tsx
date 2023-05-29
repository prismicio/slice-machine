import { Close, Flex, Heading, Paragraph } from "theme-ui";
import { FC } from "react";

import { Button } from "@components/Button";
import Card from "@components/Card";
import SliceMachineModal from "@components/SliceMachineModal";

type DeleteSliceZoneModalProps = {
  isDeleteSliceZoneModalOpen: boolean;
  deleteSliceZone: () => void;
  closeDeleteSliceZoneModal: () => void;
};

export const DeleteSliceZoneModal: FC<DeleteSliceZoneModalProps> = ({
  isDeleteSliceZoneModalOpen,
  deleteSliceZone,
  closeDeleteSliceZoneModal,
}) => {
  return (
    <SliceMachineModal
      isOpen={isDeleteSliceZoneModalOpen}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          maxWidth: 612,
        },
      }}
      onRequestClose={closeDeleteSliceZoneModal}
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
        sx={{ border: "none", overflow: "hidden" }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Heading sx={{ fontSize: "14px", fontWeight: "bold", ml: 1 }}>
              Do you really want to delete Slice Zone?
            </Heading>
            <Close type="button" onClick={closeDeleteSliceZoneModal} />
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
              onClick={closeDeleteSliceZoneModal}
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
              onClick={deleteSliceZone}
              sx={{ minHeight: 39, minWidth: 78 }}
            />
          </Flex>
        )}
      >
        <Paragraph>You're about to delete Slice Zone.</Paragraph>
      </Card>
    </SliceMachineModal>
  );
};
