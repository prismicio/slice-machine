import { Box, Button } from "@prismicio/editor-ui";
import { Field, Form, Formik } from "formik";
import { camelCase } from "lodash";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Input, Label, Text } from "theme-ui";

import Card from "@/legacy/components/Card/Default";
import SliceMachineModal from "@/legacy/components/SliceMachineModal";
import { VariationSM } from "@/legacy/lib/models/common/Slice";

const Error = ({ msg }: { msg?: string }) => (
  <Text as="span" sx={{ fontSize: 12, color: "error", mt: "5px", ml: 2 }}>
    {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing */}
    {msg || "Error!"}
  </Text>
);
const AddVariationModal: React.FunctionComponent<{
  isOpen: boolean;
  loading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClose: () => any;
  onSubmit: (
    id: string,
    name: string,
    copiedVariation: VariationSM,
  ) => Promise<void>;
  initialVariation: VariationSM;
  variations: ReadonlyArray<VariationSM>;
}> = ({ isOpen, onClose, onSubmit, initialVariation, variations }) => {
  const [errors, setErrors] = useState<{ [fieldKey: string]: string }>({});
  const [generatedId, setGeneratedId] = useState<string>("");
  const [isGeneratedFromName, setIsGeneratedFromName] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [origin, setOrigin] = useState<{ value: string; label: string }>({
    value: initialVariation.id,
    label: initialVariation.name,
  });
  const [isAddingVariation, setIsAddingVariation] = useState(false);

  function validateForm({
    id,
    name,
    origin,
  }: {
    id?: string;
    name?: string;
    origin: { value: string };
  }) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const idError = !(id && id.length) ? { id: "Required!" } : null;
    const existingIdError = variations.find((v) => v.id === id)
      ? { id: "This id already exists!" }
      : null;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const nameError = !(name && name.length) ? { name: "Required!" } : null;
    const originError = !(
      origin.value.length && variations.find((v) => v.id === origin.value)
    )
      ? { id: "You must select an existing variation!" }
      : null;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const invalidIdError = id &&
      id.length &&
      !/^[A-Za-z0-9]+([A-Za-z0-9]+)*$/.exec(id) && {
        id: "No special characters allowed",
      };

    return {
      ...idError,
      ...existingIdError,
      ...nameError,
      ...originError,
      ...invalidIdError,
    };
  }

  function generateId(str: string) {
    const slug = camelCase(str);
    setGeneratedId(slug);
  }

  function changeName(str: string) {
    setName(str);
    if (isGeneratedFromName) generateId(str);
  }

  function changeId(str: string) {
    setIsGeneratedFromName(false);
    generateId(str);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function reset() {
    setGeneratedId("");
    setName("");
    setErrors({});
    setIsGeneratedFromName(true);
    setOrigin({ value: initialVariation.id, label: initialVariation.name });
  }

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVariation, isOpen]);

  // eslint-disable-next-line @typescript-eslint/require-await
  async function handleSubmit() {
    const data = { id: generatedId, name, origin };
    const errors = validateForm(data);
    if (Object.keys(errors).length) setErrors(errors);
    else {
      const copiedVariation = variations.find((v) => v.id === origin.value);
      if (copiedVariation) {
        setIsAddingVariation(true);
        await onSubmit(generatedId, name, copiedVariation);
        setIsAddingVariation(false);
        handleClose();
      }
    }
  }

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick
      onRequestClose={() => handleClose()}
      contentLabel="Widget Form Modal"
      style={{
        content: {
          maxWidth: "700px",
        },
      }}
    >
      <Formik
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        initialValues={{ id: generatedId, name, origin } as any}
        onSubmit={handleSubmit}
      >
        <Form
          id={"variation-add"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              handleSubmit();
            }
          }}
        >
          <Box>
            <Card
              sx={{ textAlign: "left" }}
              HeaderContent={<Text as="h2">Add new Variation</Text>}
              FooterContent={
                <Box gap={16} alignItems="center">
                  <Button onClick={handleClose} color="grey">
                    Cancel
                  </Button>
                  <Button loading={isAddingVariation}>Submit</Button>
                </Box>
              }
              close={handleClose}
            >
              <Box flexDirection="column" padding={{ block: 16 }}>
                <Label htmlFor="name" sx={{ mb: 1 }}>
                  Variation name*
                  {errors.name ? <Error msg={errors.name} /> : ""}
                </Label>
                <Field
                  autoComplete="off"
                  id="name"
                  name="name"
                  placeholder="e.g. Grid - With Icon"
                  as={Input}
                  maxLength={30}
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    changeName(e.currentTarget.value)
                  }
                />
                <Text>
                  It will appear here in Slice Machine, and in the page editor
                  in Prismic
                </Text>
              </Box>
              <Box flexDirection="column" padding={{ bottom: 16 }}>
                <Label htmlFor="id" sx={{ mb: 1 }}>
                  Variation ID*{errors.id ? <Error msg={errors.id} /> : ""}
                </Label>
                <Field
                  autoComplete="off"
                  id="id"
                  name="id"
                  placeholder="e.g. GridWithIcon"
                  as={Input}
                  maxLength={30}
                  value={generatedId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    changeId(e.currentTarget.value)
                  }
                />
                <Text>
                  It's generated automatically based on the variation name and
                  will appear in the API responses.
                </Text>
              </Box>

              <Box flexDirection="column" padding={{ bottom: 8 }}>
                <Label htmlFor="origin" sx={{ mb: 1 }}>
                  Duplicate from
                </Label>
                <Select
                  name="origin"
                  options={variations.map((v) => ({
                    value: v.id,
                    label: v.name,
                  }))}
                  onChange={(v: { label: string; value: string } | null) => {
                    if (v) setOrigin(v);
                  }}
                  defaultValue={origin}
                  maxMenuHeight={150}
                  theme={(theme) => {
                    return {
                      ...theme,
                      colors: {
                        ...theme.colors,
                        text: "text",
                        primary: "background",
                      },
                    };
                  }}
                />
              </Box>
            </Card>
          </Box>
        </Form>
      </Formik>
    </SliceMachineModal>
  );
};

export default AddVariationModal;
