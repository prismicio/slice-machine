import React, { Fragment } from "react";
import { BsImage, BsFillPlusSquareFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { Text, Badge, Flex, ThemeUIStyleObject } from "theme-ui";
import SliceMachineIconButton, {
  SliceMachineIconButtonProps,
} from "@components/SliceMachineIconButton";
import { FormFieldInput } from "@components/FormFields";
import { FieldMetaProps, useField } from "formik";

type ThumbnailButtonProps = Pick<
  SliceMachineIconButtonProps,
  "onClick" | "error" | "active" | "sx"
> & {
  onDelete?: React.MouseEventHandler<HTMLDivElement>;
  text: React.ReactNode;
};

export const ThumbnailButton: React.FC<ThumbnailButtonProps> = ({
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
    error={error}
    onClick={onClick}
    active={active}
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
          <Badge onClick={onDelete} variant="circle-right">
            <MdCancel />
          </Badge>
        ) : null}
      </Fragment>
    )}
  />
);

export const AddThumbnailButton: React.FC<{
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ onClick }) => (
  <SliceMachineIconButton
    fitButton
    onClick={onClick}
    sx={{
      width: "64px",
      height: "64px",
      border: ({ colors }) => `1px solid ${String(colors?.borders)}`,
    }}
    Icon={() => (
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <BsFillPlusSquareFill
          size={34}
          color="#5263BA"
          aria-label="Add a thumbnail"
        />
      </Flex>
    )}
  />
);

export const ConstraintForm: React.FC<{
  prefix: string;
  required?: boolean;
  display: boolean;
}> = ({ prefix, required = false, display }) => {
  const [_field, meta] = useField(prefix);

  const requiredChar = required ? "*" : "";

  if (!display) {
    return null;
  }

  return (
    <Fragment>
      <TexField
        name={`${prefix}.name`}
        label={`Name${requiredChar}`}
        placeholder="main"
        sx={{ mb: 3 }}
        isConstraint={prefix === "config.constraint"}
        meta={meta}
      />
      <NumberField
        name={`${prefix}.width`}
        label={`Width (px)${requiredChar}`}
        placeholder=" "
        sx={{ mb: 3 }}
      />
      <NumberField
        name={`${prefix}.height`}
        label={`Height (px)${requiredChar}`}
        placeholder=" "
      />
    </Fragment>
  );
};

const TexField: React.FC<{
  name: string;
  label: string;
  placeholder: string;
  isConstraint: boolean;
  meta: FieldMetaProps<string>;
  sx?: ThemeUIStyleObject;
}> = ({ name, label, placeholder, meta, isConstraint, ...props }) => {
  const [field] = useField<string>(name);

  return (
    <FormFieldInput
      {...props}
      fieldName={name}
      meta={meta}
      formField={{ label, placeholder }}
      field={
        isConstraint
          ? { value: "main", readOnly: true }
          : { value: field.value }
      }
      variant={isConstraint ? "disabled" : "primary"}
    />
  );
};

const NumberField: React.FC<{
  name: string;
  label: string;
  placeholder: string;
  sx?: ThemeUIStyleObject;
}> = ({ name, label, placeholder, ...props }) => {
  const [field, meta] = useField<string>(name);
  return (
    <FormFieldInput
      {...props}
      fieldName={name}
      formField={{ label, placeholder }}
      meta={meta}
      field={{
        min: 0,
        type: "number",
        value: field.value || "",
        onKeyDown: (event) => {
          if (event.key === "e" || event.key === "-" || event.key === "+") {
            event.preventDefault();
          }
        },
      }}
    />
  );
};
