import { Field } from "formik";
import { Button, Heading, Box, Label, Input, Text } from "theme-ui";

import ModalFormCard from "../../../../components/ModalFormCard";

export enum ActionType {
  UPDATE = "update",
  DELETE = "delete",
}

const InputBox = ({
  name,
  label,
  placeholder,
  error,
  ...rest
}: {
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}) => (
  <Box mb={3}>
    <Label htmlFor={name} mb={2}>
      {label}
    </Label>
    <Field
      name={name}
      type="text"
      placeholder={placeholder}
      as={Input}
      autoComplete="off"
      {...rest}
    />
    {error ? <Text sx={{ color: "error", mt: 1 }}>{error}</Text> : null}
  </Box>
);

const formId = "create-tab";

const CreateCustomtypeForm = ({
  title,
  isOpen,
  onSubmit,
  close,
  tabIds,
  allowDelete,
}: {
  title: string;
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSubmit: Function;
  close: () => void;
  tabIds: ReadonlyArray<string>;
  allowDelete: boolean;
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
      initialValues={{
        id: "",
        actionType: null,
      }}
      validate={({ id }) => {
        if (!id) {
          return {
            id: "Tab ID is required",
          };
        }
        if (tabIds.includes(id.toLowerCase())) {
          return {
            id: "Tab exists already",
          };
        }
      }}
      content={{
        title,
      }}
    >
      {({ errors, values, setFieldValue, isValid }) => (
        <Box>
          <Box sx={{ px: 4, py: 4 }}>
            <InputBox
              name="id"
              label="Update Tab ID"
              placeholder="A label for selecting the tab (i.e. not used in the API)"
              error={errors.id}
              onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                if (values.id !== event.target.value) {
                  setFieldValue("id", event.target.value.trim());
                }
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFieldValue("id", e.target.value);
              }}
            />
            <Button
              type="button"
              sx={{ mt: 3, width: "100%" }}
              disabled={!isValid}
              onClick={() => {
                if (values.id && values.id.length) {
                  onSubmit({
                    id: values.id.trim(),
                    actionType: ActionType.UPDATE,
                  });
                }
                close();
              }}
            >
              Save
            </Button>
          </Box>
          <Box
            as="hr"
            sx={{
              borderBottom: "none",
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              borderTop: (theme) => `1px solid ${theme?.colors?.borders}`,
            }}
          />
          {allowDelete && (
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
                  onSubmit({
                    id: values.id,
                    actionType: ActionType.DELETE,
                  });
                  close();
                }}
              >
                Yes, delete tab
              </Button>
            </Box>
          )}
        </Box>
      )}
    </ModalFormCard>
  );
};

export default CreateCustomtypeForm;
