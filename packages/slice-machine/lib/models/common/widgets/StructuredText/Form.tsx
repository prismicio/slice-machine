import { useEffect, useState } from "react";
import * as yup from "yup";
import { createFieldNameFromKey } from "@lib/forms";
import { CheckBox as CheckBoxConstructor } from "@lib/forms/fields";
import { DefaultFields } from "@lib/forms/defaults";
import options, { optionValues } from "./options";
import WidgetFormField from "@lib/builders/common/EditModal/Field";
import { Text, Button, Label, Checkbox, Flex, Box } from "theme-ui";
import { Col, Flex as FlexGrid } from "@components/Flex";
import SliceMachineIconButton from "@components/SliceMachineIconButton";

import { has } from "fp-ts/Record";
import { AnyObject } from "yup/lib/types";
import { isObject, isString } from "lodash";

const isAllSet = (curr: Array<string>): boolean =>
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  !optionValues.find((e) => !curr.includes(e));

const _createInitialOptions = (str: string) => {
  const arr = str.split(",");
  return options.reduce<Array<string>>((acc, { value }) => {
    if (arr.includes(value)) {
      return [...acc, value];
    }
    return acc;
  }, []);
};

function getValueFromYupContext(
  ctx: yup.TestContext<AnyObject>,
  key: string
): string | null {
  if (
    has("parent", ctx) &&
    isObject(ctx.parent) &&
    has(key, ctx.parent) &&
    isString(ctx.parent[key])
  )
    return ctx.parent[key];
  return null;
}

function createValidator(key: "single" | "multi") {
  return () =>
    yup.string().test({
      name: key,
      message: `Options cannot be empty`,
      test: function (_, ctx) {
        const other = key === "single" ? "multi" : "single";
        const val = getValueFromYupContext(ctx, key);
        const otherVal = getValueFromYupContext(ctx, other);

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (otherVal && typeof otherVal === "string") {
          return true;
        }
        if (typeof val !== "string") {
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if ((!val || !val.length) && (!otherVal || !otherVal.length)) {
          return false;
        }
        const arr = val.split(",");
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (arr.find((e) => !optionValues.includes(e))) {
          return false;
        }
        return true;
      },
    });
}

const FormFields = {
  ...DefaultFields,
  allowTargetBlank: CheckBoxConstructor("Allow target blank for links"),
  single: {
    validate: createValidator("single"),
  },
  multi: {
    validate: createValidator("multi"),
  },
};

const accessors = ["config.single", "config.multi"];

type Config = {
  allowTargetBlank: boolean;
  label: string; // RichText
  placeholder: string;
  single?: string;
  multi?: string;
};

type FormValues = {
  config: Config;
  id: string;
};

const WidgetForm: React.FC<{
  initialValues: FormValues;
  values: FormValues;
  errors: FormValues;
  fields: Array<Record<string, unknown>>; // fields of all the widgets
  setFieldValue: (a: string, b?: string) => void;
}> = (props) => {
  const {
    initialValues,
    values: formValues,
    errors,
    fields,
    setFieldValue,
  } = props;

  const {
    config: { single, multi },
  } = formValues;

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const initialOptions = single
    ? _createInitialOptions(single)
    : // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      (multi && _createInitialOptions(multi)) || optionValues;

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const [isMulti, setIsMulti] = useState(single ? false : true);

  const [acceptOptions, setAcceptOptions] = useState(initialOptions);

  useEffect(() => {
    const fieldNameIndex = isMulti ? 1 : 0;
    setFieldValue(accessors[fieldNameIndex], acceptOptions.join(","));
    setTimeout(() => {
      // prevent tests from failing for both values
      setFieldValue(accessors[1 - fieldNameIndex], undefined);
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMulti, acceptOptions]);

  return (
    <FlexGrid>
      {Object.entries(FormFields).map(([key, field]) => (
        <Col key={key}>
          <WidgetFormField
            fieldName={createFieldNameFromKey(key)}
            formField={field}
            fields={fields}
            initialValues={initialValues}
          />
        </Col>
      ))}
      <Col>
        <Label
          htmlFor="accept"
          variant="label.primary"
          sx={{
            mt: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          Accept*
          <Button
            type="button"
            variant="buttons.textButton"
            onClick={() => {
              if (isAllSet(acceptOptions)) {
                return setAcceptOptions([]);
              }
              setAcceptOptions(optionValues);
            }}
          >
            {isAllSet(acceptOptions) ? "Unselect All" : "Select all"}
          </Button>
        </Label>
        {options.map((opt) => (
          <SliceMachineIconButton
            fitButton
            useActive
            key={opt.value}
            label={opt.label}
            size={14}
            Icon={opt.icon}
            sx={{
              p: "16px",
              mb: 2,
              mr: 2,
              variant: "buttons.selectIcon",
            }}
            active={acceptOptions.includes(opt.value)}
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
              if (acceptOptions.find((e) => e === opt.value)) {
                return setAcceptOptions(
                  acceptOptions.filter((e) => e !== opt.value)
                );
              }
              setAcceptOptions([...acceptOptions, opt.value]);
            }}
          />
        ))}
        {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
        {errors.config?.[isMulti ? "multi" : "single"] ? (
          <Box sx={{ position: "absolute" }}>
            <Text as="span" variant="text.labelError" pl={0}>
              {errors.config[isMulti ? "multi" : "single"]}
            </Text>
          </Box>
        ) : null}
      </Col>
      <Col>
        <Flex
          sx={{
            mt: 2,
            alignItems: "center",
            height: "100%",
          }}
        >
          <Label variant="label.border">
            <Checkbox checked={isMulti} onChange={() => setIsMulti(!isMulti)} />
            Allow multiple paragraphs
          </Label>
        </Flex>
      </Col>
    </FlexGrid>
  );
};

export { FormFields };

export default WidgetForm;
