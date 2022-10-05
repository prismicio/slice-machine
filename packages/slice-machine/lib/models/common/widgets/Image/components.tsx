import React, { Fragment } from "react";
import { BsImage, BsFillPlusSquareFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { Text, Badge, Flex } from "theme-ui";
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
  const [field, meta, helpers] = useField(prefix);

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
      <FormFieldInput
        fieldName={`${prefix}.name`}
        meta={{
          ...meta,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:disable
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          error: meta.error && meta.error?.name,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:enable
        }}
        formField={{ label: `Name${requiredChar}`, placeholder: "main" }}
        fieldProps={{
          readOnly: prefix === "config.constraint",
        }}
        field={
          prefix === "config.constraint"
            ? { value: "main" }
            : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore:disable
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              { value: field.value.name, onChange: createSetField("name") }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:enable
        }
        variant={prefix === "config.constraint" ? "disabled" : "primary"}
        sx={{ mb: 3 }}
      />
      <FormFieldInput
        fieldName={`${prefix}.width`}
        meta={{
          ...meta,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:disable
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          error: meta.error && meta.error.width,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:enable
        }}
        formField={{ label: `Width (px)${requiredChar}`, placeholder: " " }}
        fieldProps={{
          type: "number",
        }}
        field={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:disable
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value: field.value.width,
          onChange: createSetField("width", parseInt),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:enable
        }}
        sx={{ mb: 3 }}
      />
      <FormFieldInput
        fieldName={`${prefix}.height`}
        meta={{
          ...meta,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:disable
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          error: meta.error && meta.error.height,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:enable
        }}
        formField={{ label: `Height (px)${requiredChar}`, placeholder: " " }}
        fieldProps={{
          type: "number",
        }}
        field={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:disable
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value: field.value.height,
          onChange: createSetField("height", parseInt),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore:enable
        }}
      />
    </Fragment>
  );
};
