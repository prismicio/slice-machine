/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Fragment } from "react";
import { BsImage, BsFillPlusSquareFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";

import { Text, Badge, Flex } from "theme-ui";
import SliceMachineIconButton from "@components/SliceMachineIconButton";
import { FormFieldInput } from "@components/FormFields";
import { useField } from "formik";

export const ThumbnailButton = ({
  onClick,
  error,
  onDelete,
  active,
  text,
  sx,
}) => (
  <SliceMachineIconButton
    useActive
    fitButton
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    error={error}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
    onClick={onClick}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
    active={active}
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
    sx={{ position: "relative", width: "64px", height: "64px", ...sx }}
    Icon={() => (
      <Fragment>
        <Flex
          sx={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BsImage size={22} />
          <Text mt={1}>{text}</Text>
        </Flex>
        {onDelete ? (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          <Badge onClick={onDelete} variant="circle-right">
            <MdCancel />
          </Badge>
        ) : null}
      </Fragment>
    )}
  />
);

export const AddThumbnailButton = ({ onClick }) => (
  <SliceMachineIconButton
    fitButton
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    onClick={onClick}
    sx={{
      width: "64px",
      height: "64px",
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      border: ({ colors }) => `1px solid ${colors.borders}`,
    }}
    Icon={() => (
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BsFillPlusSquareFill size={34} color="#5263BA" />
      </Flex>
    )}
  />
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ConstraintForm = ({ prefix, required, display, error = {} }) => {
  if (!display) {
    return null;
  }
  const requiredChar = required ? "*" : "";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-argument
  const [field, meta, helpers] = useField(prefix);

  const createSetField =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return


      (key, fn = (v) => v) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      (e) => {
        helpers.setTouched(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const cast = fn(e.target.value);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value =
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          e.target.type === "number" ? (isNaN(cast) ? null : cast) : cast;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
        helpers.setValue({ ...field.value, [key]: value });
      };

  return (
    <Fragment>
      <FormFieldInput
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions
        fieldName={`${prefix}.name`}
        meta={{
          ...meta,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-assignment
          error: meta.error && meta.error.name,
        }}
        formField={{ label: `Name${requiredChar}`, placeholder: "main" }}
        field={
          prefix === "config.constraint"
            ? { value: "main", readOnly: true }
            : // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              { value: field.value.name, onChange: createSetField("name") }
        }
        variant={prefix === "config.constraint" ? "disabled" : "primary"}
        sx={{ mb: 3 }}
      />
      <FormFieldInput
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        fieldName={`${prefix}.width`}
        meta={{
          ...meta,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          error: meta.error && meta.error.width,
        }}
        formField={{ label: `Width (px)${requiredChar}`, placeholder: " " }}
        field={{
          type: "number",
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value: field.value.width,
          onChange: createSetField("width", parseInt),
        }}
        sx={{ mb: 3 }}
      />
      <FormFieldInput
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        fieldName={`${prefix}.height`}
        meta={{
          ...meta,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          error: meta.error && meta.error.height,
        }}
        formField={{ label: `Height (px)${requiredChar}`, placeholder: " " }}
        field={{
          type: "number",
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value: field.value.height,
          onChange: createSetField("height", parseInt),
        }}
      />
    </Fragment>
  );
};
