import { Button, Box } from "theme-ui";

import ModalFormCard from "../../../../components/ModalFormCard";
import { InputBox } from "./InputBox";

const formId = "create-tab";

const UpdateCustomTypeForm = ({
  isOpen,
  onSubmit,
  close,
  tabIds,
}: {
  isOpen: boolean;
  onSubmit: (values: { id: string }) => void;
  close: () => void;
  tabIds: ReadonlyArray<string>;
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
        title: "Rename Tab",
      }}
    >
      {({ errors, values, setFieldValue, isValid }) => (
        <Box sx={{ px: 4, py: 4 }}>
          <InputBox
            name="id"
            label="Rename Tab ID"
            placeholder="A label for selecting the tab (i.e. not used in the API)"
            error={errors.id}
            onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
              if (values.id !== event.target.value) {
                void setFieldValue("id", event.target.value.trim());
              }
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              void setFieldValue("id", e.target.value);
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
                });
              }
              close();
            }}
          >
            Save
          </Button>
        </Box>
      )}
    </ModalFormCard>
  );
};

export default UpdateCustomTypeForm;
