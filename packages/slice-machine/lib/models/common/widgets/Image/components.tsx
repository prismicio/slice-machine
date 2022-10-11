import React, { Fragment } from "react";
import { BsImage, BsFillPlusSquareFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { Text, Badge, Flex, ThemeUIStyleObject } from "theme-ui";
import SliceMachineIconButton, {
  SliceMachineIconButtonProps,
} from "@components/SliceMachineIconButton";
import { FormFieldInput } from "@components/FormFields";
import { useField } from "formik";

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
        <BsFillPlusSquareFill size={34} color="#5263BA" />
      </Flex>
    )}
  />
);

export const ConstraintForm: React.FC<{
  prefix: string;
  required?: boolean;
  display: boolean;
}> = ({ prefix, required = false, display }) => {
  if (!display) {
    return null;
  }
  const requiredChar = required ? "*" : "";
  const [field, _meta, helpers] = useField(prefix);

  const createSetField =
    (key: string, fn = (v: string): number | string => v) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      helpers.setTouched(true);
      const cast = fn(e.target.value);
      const value =
        e.target.type === "number"
          ? typeof cast === "number" && isNaN(cast)
            ? null
            : cast
          : cast;
      helpers.setValue({ ...field.value, [key]: value });
    };

  return (
    <Fragment>
      <TexField
        prefix={prefix}
        name="name"
        label={`Name${requiredChar}`}
        placeholder="main"
        onChangeSetField={createSetField("name")}
        sx={{ mb: 3 }}
      />
      <NumberField
        prefix={prefix}
        name="width"
        onChangeSetField={createSetField("width", parseInt)}
        label={`Width (px)${requiredChar}`}
        placeholder=" "
        sx={{ mb: 3 }}
      />
      <NumberField
        prefix={prefix}
        name="height"
        onChangeSetField={createSetField("height", parseInt)}
        label={`Height (px)${requiredChar}`}
        placeholder=" "
      />
    </Fragment>
  );
};

const TexField: React.FC<{
  prefix: string;
  name: string;
  label: string;
  placeholder: string;
  onChangeSetField: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: ThemeUIStyleObject;
}> = ({ prefix, name, label, placeholder, onChangeSetField, ...props }) => {
  const fieldName = `${prefix}.${name}`;

  const [field, meta] = useField<string>(fieldName);
  return (
    <FormFieldInput
      {...props}
      fieldName={fieldName}
      meta={meta}
      formField={{ label, placeholder }}
      field={
        prefix === "config.constraint"
          ? { value: "main", readOnly: true }
          : { value: field.value, onChange: onChangeSetField }
      }
      variant={prefix === "config.constraint" ? "disabled" : "primary"}
    />
  );
};

const NumberField: React.FC<{
  prefix: string;
  name: string;
  label: string;
  placeholder: string;
  onChangeSetField: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: ThemeUIStyleObject;
}> = ({ prefix, name, label, placeholder, onChangeSetField, ...props }) => {
  const fieldName = `${prefix}.${name}`;

  const [field, meta] = useField<number>(fieldName);

  return (
    <FormFieldInput
      {...props}
      fieldName={fieldName}
      meta={meta}
      formField={{ label, placeholder }}
      field={{
        type: "number",
        value: field.value || "",
        onChange: onChangeSetField,
      }}
    />
  );
};
