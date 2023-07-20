import { Variation } from "@models/common/Variation";
import { VariationSM } from "@lib/models/common/Slice";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import SliceMachineModal from "@components/SliceMachineModal";

import Card from "@components/Card/Default";
import Select from "react-select";

import { Text, Box, Button, Label, Input, Flex } from "theme-ui";

const Error = ({ msg }: { msg?: string }) => (
  <Text as="span" sx={{ fontSize: 12, color: "error", mt: "5px", ml: 2 }}>
    {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing */}
    {msg || "Error!"}
  </Text>
);
const VariationModal: React.FunctionComponent<{
  isOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClose: () => any;
  onSubmit: (id: string, name: string, copiedVariation: VariationSM) => void;
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
      ? { id: "Yuu must select an existing variation!" }
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
    const slug = Variation.generateId(str);
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
        onSubmit(generatedId, name, copiedVariation);
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
                <Flex sx={{ justifyContent: "flex-end" }}>
                  <Button onClick={handleClose} mr={2} variant="secondary">
                    Cancel
                  </Button>
                  <Button type="submit">Submit</Button>
                </Flex>
              }
              close={handleClose}
            >
              <Box sx={{ pb: 4, mt: 4 }}>
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
              <Box sx={{ pb: 4 }}>
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

              <Box sx={{ pb: 4 }}>
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

export default VariationModal;
