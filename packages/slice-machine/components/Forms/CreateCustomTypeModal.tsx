import { Field, useField } from "formik";
import { Box, Flex, Label, Input, Text, Radio } from "theme-ui";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";

import ModalFormCard from "@components/ModalFormCard";

type InputBoxProps = {
  name: string;
  label: string;
  placeholder: string;
  error?: string;
};

const InputBox: React.FunctionComponent<InputBoxProps> = ({
  name,
  label,
  placeholder,
  error,
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
    />
    {error ? <Text sx={{ color: "error", mt: 1 }}>{error}</Text> : null}
  </Box>
);

const formId = "create-custom-type";

const FlexCard = ({
  selected,
  ...rest
}: {
  selected: boolean;
  children: any;
  onClick: any;
}) => (
  <Flex
    sx={{
      p: "24px",
      mb: 3,
      alignItems: "top",
      cursor: "pointer",
      borderRadius: "6px",
      backgroundColor: "grayLight",
      boxShadow: selected ? (t) => `0 0 0 2px ${t.colors?.primary}` : "none",
      "&:hover": {
        boxShadow: (t) => `0 0 0 2px ${t.colors?.primary}`,
      },
    }}
    {...rest}
  />
);

const SelectRepeatable = () => {
  const [field, _, helpers] = useField("repeatable");
  return (
    <Box mb={2}>
      <FlexCard selected={field.value} onClick={() => helpers.setValue(true)}>
        <Radio checked={field.value} />
        <Box
          sx={{
            marginLeft: 2,
          }}
        >
          Repeatable type
          <Box as="p" sx={{ fontSize: "12px", color: "textClear", mt: 1 }}>
            Best for multiple instances like blog posts, authors, products...
          </Box>
        </Box>
      </FlexCard>
      <FlexCard selected={!field.value} onClick={() => helpers.setValue(false)}>
        <Radio checked={!field.value} />
        <Box
          sx={{
            marginLeft: 2,
          }}
        >
          Single type
          <Box as="p" sx={{ fontSize: "12px", color: "textClear", mt: 1 }}>
            Best for a unique page, like the homepage or privacy policy page...
          </Box>
        </Box>
      </FlexCard>
    </Box>
  );
};

type CreateCustomTypeModalProps = {
  isOpen: boolean;
  onSubmit: (values: any) => void;
  close: () => void;
  customTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
};

const CreateCustomTypeModal: React.FunctionComponent<CreateCustomTypeModalProps> =
  ({ isOpen, onSubmit, close, customTypes }) => {
    return (
      <ModalFormCard
        isOpen={isOpen}
        widthInPx="530px"
        formId={formId}
        close={() => close()}
        onSubmit={(values: {}) => {
          onSubmit(values);
        }}
        initialValues={{
          repeatable: true,
        }}
        validate={({ id }: { id: string }) => {
          if (id && !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.exec(id)) {
            return { id: "Invalid id: No special characters allowed" };
          }
          if (id && customTypes.map((e) => e?.id.toLowerCase()).includes(id)) {
            return { id: `ID "${id}" exists already` };
          }
        }}
        content={{
          title: "Create a new custom type",
        }}
      >
        {({ errors }: { errors: { id?: string } }) => (
          <Box>
            <SelectRepeatable />
            <InputBox
              name="label"
              label="Custom Type Name"
              placeholder="My Custom Type"
            />
            <InputBox
              name="id"
              label="Custom Type ID"
              placeholder="my-custom-type"
              error={errors.id}
            />
          </Box>
        )}
      </ModalFormCard>
    );
  };

export default CreateCustomTypeModal;
