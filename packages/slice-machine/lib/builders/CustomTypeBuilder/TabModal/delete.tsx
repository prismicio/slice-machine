import { Button, Heading, Box, Text } from "theme-ui";

import ModalFormCard from "../../../../components/ModalFormCard";

const formId = "delete-tab";

const DeleteCustomtypeForm = ({
  title,
  isOpen,
  onSubmit,
  close,
}: {
  title: string;
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSubmit: (id: string) => void;
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
        onSubmit(values.id);
        close();
      }}
      initialValues={{ id: "" }}
      content={{
        title,
      }}
    >
      {({ values }) => (
        <Box>
          <Box
            as="hr"
            sx={{
              borderBottom: "none",
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              borderTop: (theme) => `1px solid ${theme?.colors?.borders}`,
            }}
          />
          <Box sx={{ px: 4, py: 4 }}>
            <Heading as="h4">Delete this tab?</Heading>
            <Text as="p" color="textClear" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Text>
            <Button
              type="button"
              variant="buttons.actionDelete"
              sx={{ mt: 3 }}
              onClick={() => {
                onSubmit(values.id);
                close();
              }}
            >
              Yes, delete tab
            </Button>
          </Box>
        </Box>
      )}
    </ModalFormCard>
  );
};

export default DeleteCustomtypeForm;
