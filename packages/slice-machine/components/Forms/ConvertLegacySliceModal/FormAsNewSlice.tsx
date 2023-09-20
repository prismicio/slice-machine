import { useSelector } from "react-redux";
import { Field, Input, Label } from "theme-ui";
import Select from "react-select";
import { Formik } from "formik";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  Text,
  tokens,
} from "@prismicio/editor-ui";

import { SliceMachineStoreType } from "@src/redux/type";
import { getRemoteSlices } from "@src/modules/slices";
import { pascalize } from "@lib/utils/str";

import { validateSliceModalValues as validateAsNewSliceValues } from "../formsValidator";
import * as styles from "./ConvertLegacySliceModal.css";
import { FormProps } from "./types";

export const FormAsNewSlice: React.FC<FormProps> = ({
  isOpen,
  close,
  onSubmit,
  isLoading,
  slice,
  libraries,
}) => {
  const { remoteSlices } = useSelector((store: SliceMachineStoreType) => ({
    remoteSlices: getRemoteSlices(store),
  }));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      size="small"
    >
      <DialogHeader title="Convert to new slice" />
      <DialogContent>
        <Formik
          validateOnChange
          initialValues={{
            sliceName: pascalize(slice.key),
            from: libraries[0]?.name,
          }}
          validate={(values) => {
            return validateAsNewSliceValues(values, libraries, remoteSlices);
          }}
          onSubmit={(values) => {
            onSubmit({ libraryID: values.from, sliceID: values.sliceName });
          }}
        >
          {(formik) => {
            return (
              <form
                id="convert-legacy-slice-modal-as-new-slice"
                data-cy="convert-legacy-slice-modal-as-new-slice"
                className={styles.layout.small}
              >
                <ScrollArea
                  style={{
                    height: "100%",
                    display: "flex",
                    gap: tokens.space[12],
                    paddingInline: tokens.space[24],
                    paddingBlock: tokens.space[16],
                  }}
                >
                  <div>
                    <Label
                      htmlFor="sliceName"
                      sx={{
                        mb: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      Slice Name
                      {typeof formik.errors.sliceName === "string" ? (
                        <Text variant="small" color="tomato10">
                          {formik.errors.sliceName}
                        </Text>
                      ) : null}
                    </Label>
                    <Field
                      autoComplete="off"
                      id="sliceName"
                      name="sliceName"
                      type="text"
                      placeholder={`Pascalised Slice API ID (e.g. ${pascalize(
                        slice.key
                      )})`}
                      as={Input}
                      maxLength={30}
                      value={formik.values.sliceName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        void formik.setFieldValue(
                          "sliceName",
                          e.currentTarget.value
                        )
                      }
                      data-cy="slice-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slice" sx={{ mb: 2 }}>
                      Target Library
                    </Label>
                    <Select
                      name="slice"
                      options={libraries.map((v) => ({
                        value: v.name,
                        label: v.name,
                      }))}
                      onChange={(option) =>
                        option
                          ? void formik.setFieldValue("from", option.value)
                          : null
                      }
                      defaultValue={{
                        value: formik.values.from,
                        label: formik.values.from,
                      }}
                      styles={{
                        option: (provided) => ({
                          ...provided,
                          // Color of item text (Dark/Shade-01)
                          color: "#161618",
                        }),
                      }}
                      theme={(theme) => {
                        return {
                          ...theme,
                          colors: {
                            ...theme.colors,
                            // Background of selected item (Gray/Shade-05)
                            primary: "#E9E8EA",
                          },
                        };
                      }}
                      menuPortalTarget={document.body}
                    />
                  </div>
                </ScrollArea>
                <DialogActions
                  ok={{
                    text: "Convert",
                    onClick: () => void formik.submitForm(),
                    loading: isLoading,
                    disabled: !formik.isValid,
                  }}
                  cancel={{ text: "Cancel" }}
                />
              </form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
