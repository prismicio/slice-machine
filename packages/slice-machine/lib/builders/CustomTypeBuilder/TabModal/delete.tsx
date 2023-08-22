import { Button, Heading, Box, Text } from "theme-ui";

import ModalFormCard from "../../../../components/ModalFormCard";

const formId = "create-tab";

const DeleteCustomTypeForm = ({
  isOpen,
  onSubmit,
  close,
}: {
  isOpen: boolean;
  onSubmit: (values: Record<string, never>) => void;
  close: () => void;
}) => {
  return (
    <ModalFormCard
      omitFooter
      isOpen={isOpen}
      widthInPx="530px"
      formId={formId}
      close={close}
      cardProps={{ bodySx: { p: 0 } }}
      onSubmit={(values) => {
        onSubmit(values);
        close();
      }}
      initialValues={{}}
      content={{
        title: "Remove Tab",
      }}
    >
      {() => (
        <Box sx={{ px: 4, py: 4 }}>
          <Heading as="h4">Remove this tab?</Heading>
          <Text as="p" color="textClear" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Text>
          <Button
            type="button"
            variant="buttons.actionDelete"
            sx={{ mt: 3 }}
            onClick={() => {
              onSubmit({});
              close();
            }}
          >
            Yes, remove tab
          </Button>
        </Box>
      )}
    </ModalFormCard>
  );
};

export default DeleteCustomTypeForm;
