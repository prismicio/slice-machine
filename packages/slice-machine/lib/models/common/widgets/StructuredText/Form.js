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

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const isAllSet = (curr) => !optionValues.find((e) => !curr.includes(e));

const _createInitialOptions = (str) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const arr = str.split(",");
  return options.reduce((acc, { value }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (arr.includes(value)) {
      return [...acc, value];
    }
    return acc;
  }, []);
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const FormFields = {
  ...DefaultFields,
  allowTargetBlank: CheckBoxConstructor("Allow target blank for links"),
};

const accessors = ["config.single", "config.multi"];

const WidgetForm = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    initialValues,
    values: formValues,
    errors,
    fields,
    setFieldValue,
  } = props;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const {
    config: { single, multi },
  } = formValues;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initialOptions = single
    ? _createInitialOptions(single)
    : (multi && _createInitialOptions(multi)) || optionValues;

  const [isMulti, setIsMulti] = useState(single ? false : true);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [acceptOptions, setAcceptOptions] = useState(initialOptions);

  useEffect(() => {
    const fieldNameIndex = isMulti ? 1 : 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    setFieldValue(accessors[fieldNameIndex], acceptOptions.join(","));
    setTimeout(() => {
      // prevent tests from failing for both values
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      setFieldValue(accessors[1 - fieldNameIndex], undefined);
    }, 100);
  }, [isMulti, acceptOptions]);

  return (
    <FlexGrid>
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.entries(FormFields).map(([key, field]) => (
          <Col key={key}>
            <WidgetFormField
              fieldName={createFieldNameFromKey(key)}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              formField={field}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              fields={fields}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              initialValues={initialValues}
            />
          </Col>
        ))
      }
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            active={acceptOptions.find((e) => e === opt.value)}
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              if (acceptOptions.find((e) => e === opt.value)) {
                return setAcceptOptions(
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                  acceptOptions.filter((e) => e !== opt.value)
                );
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              setAcceptOptions([...acceptOptions, opt.value]);
            }}
          />
        ))}
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          errors[accessors[isMulti ? 1 : 0]] ? (
            <Box sx={{ position: "absolute" }}>
              <Text as="span" variant="text.labelError" pl={0}>
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  errors[accessors[isMulti ? 1 : 0]]
                }
              </Text>
            </Box>
          ) : null
        }
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
            <Checkbox
              value={isMulti}
              defaultChecked={isMulti}
              onChange={() => setIsMulti(!isMulti)}
            />
            Allow multiple paragraphs
          </Label>
        </Flex>
      </Col>
    </FlexGrid>
  );
};

const keys = ["single", "multi"];
keys.forEach((key, index) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  FormFields[key] = {
    validate: () =>
      yup.string().test({
        name: key,
        message: `Options cannot be empty`,
        test: function () {
          if (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.parent[keys[1 - index]] &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            typeof this.parent[keys[1 - index]] === "string"
          ) {
            // if other key is set
            return true;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (typeof this.parent[key] !== "string") {
            return false;
          }
          if (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
            (!this.parent[key] || !this.parent[key].length) &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (!this.parent[keys[1 - index]] ||
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
              !this.parent[keys[1 - index]].length)
          ) {
            // if both keys are undefined
            return false;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const arr = this.parent[key].split(",");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
          if (arr.find((e) => !optionValues.includes(e))) {
            return false;
          }
          return true;
        },
      }),
  };
});

export { FormFields };

export default WidgetForm;
