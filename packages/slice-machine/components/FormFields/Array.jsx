import { Fragment, useRef, useEffect, useState } from "react";

import { FieldArray } from "formik";

import { Text, Label, Flex, Input, Button } from "theme-ui";

const FormFieldArray = ({
  field,
  meta,
  fieldName,
  label,
  focusOnNewEntry = true,
  inputPlaceholder,
  buttonLabel,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const [prevLen, setPrevLen] = useState(meta.value.length);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access
  const refs = useRef(new Array(meta.value.length));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    refs.current = refs.current.slice(0, meta.value.length);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  }, [meta.value.length]);

  useEffect(() => {
    const len = refs.current.length;
    if (focusOnNewEntry && len > prevLen) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      refs.current[len - 1].focus();
    }
    setPrevLen(len);
  }, [refs.current.length, focusOnNewEntry, prevLen]);

  return (
    <Fragment>
      <Label
        variant="label.primary"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        htmlFor={fieldName}
      >
        {label}
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
          meta.touched && meta.error ? (
            <Text as="span" variant="text.labelError">
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                meta.error
              }
            </Text>
          ) : null
        }
      </Label>
      <FieldArray
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        name={fieldName}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id={fieldName}
        {...field}
        render={(arrayHelpers) => (
          <div>
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
              field.value && field.value.length > 0
                ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                  field.value.map((opt, i) => (
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    <Flex key={`${fieldName}-${+i + 1}`} my={2}>
                      <Input
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        placeholder={inputPlaceholder}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/restrict-template-expressions
                        name={`${fieldName}.${i}`}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value={opt}
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        ref={(el) => (refs.current[i] = el)}
                        onChange={({ target: { value } }) =>
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          arrayHelpers.replace(i, value)
                        }
                      />
                      <Button
                        ml={2}
                        type="button"
                        variant="secondary"
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                        onClick={() => arrayHelpers.remove(i)}
                      >
                        -
                      </Button>
                    </Flex>
                  ))
                : null
            }
            <Button
              type="button"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              onClick={() => arrayHelpers.insert(field.value.length, "")}
            >
              {buttonLabel}
            </Button>
          </div>
        )}
      />
    </Fragment>
  );
};

export default FormFieldArray;
