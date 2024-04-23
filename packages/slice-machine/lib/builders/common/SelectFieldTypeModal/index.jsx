import Modal from "react-modal";
import SliceMachineModal from "@components/SliceMachineModal";

import { Close, Flex, Heading } from "theme-ui";

import Card from "@components/Card";
import { Flex as FlexGrid, Col } from "@components/Flex";

import FieldTypeCard from "./FieldTypeCard";

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#__next");
}

const SelectFieldTypeModal = ({ data, close, onSelect, widgetsArray }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
  if (!data.isOpen) {
    return null;
  }
  return (
    <SliceMachineModal
      isOpen
      shouldCloseOnOverlayClick
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onRequestClose={close}
      contentLabel="Widget Form Modal"
    >
      <Card
        borderFooter
        footerSx={{ p: 3 }}
        bodySx={{ pt: 2, pb: 4, px: 4 }}
        sx={{ border: "none" }}
        Header={({ radius }) => (
          <Flex
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              p: 3,
              pl: 4,
              bg: "headSection",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              borderBottom: (t) => `1px solid ${t.colors?.borders}`,
            }}
          >
            <Heading>Add a new field</Heading>

            <Close // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
              onClick={close}
            />
          </Flex>
        )}
      >
        <FlexGrid>
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            widgetsArray
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              .filter((e) => e)
              .map((widget) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const { Meta, TYPE_NAME, CUSTOM_NAME } = widget;
                return (
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions
                  <Col key={CUSTOM_NAME || TYPE_NAME}>
                    <FieldTypeCard
                      {...Meta}
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/strict-boolean-expressions
                      onSelect={() => onSelect(CUSTOM_NAME || TYPE_NAME)}
                    />
                  </Col>
                );
              })
          }
        </FlexGrid>
      </Card>
    </SliceMachineModal>
  );
};

export default SelectFieldTypeModal;
