import { useSelector } from "react-redux";
import { Formik } from "formik";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  ScrollArea,
  FormInput,
  Text,
  Select,
  SelectItem,
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
      size={{ width: 448, height: "auto" }}
    >
      <DialogHeader title="Upgrade slice" />
      <DialogContent>
        <Formik
          validateOnChange
          initialValues={{
            _init: false,
            from: libraries[0]?.name,
            sliceName: pascalize(slice.key),
          }}
          validate={(values) => {
            return validateAsNewSliceValues(values, libraries, remoteSlices);
          }}
          onSubmit={(values) => {
            onSubmit({ libraryID: values.from, sliceID: values.sliceName });
          }}
        >
          {(formik) => {
            // Just a hack to trigger validation on init for better UX
            if (!formik.values._init) {
              void formik.setFieldValue("_init", true);
            }

            return (
              <form
                id="convert-legacy-slice-modal-as-new-slice"
                data-cy="convert-legacy-slice-modal-as-new-slice"
                className={styles.form}
              >
                <ScrollArea className={styles.scrollArea}>
                  <Text variant="normal" color="grey11">
                    This will create a new slice with the same fields. The new
                    slice will replace the legacy slice in all of your types,
                    and the existing slice content will be re-mapped to the new
                    slice.
                  </Text>
                  <Text variant="normal" color="grey11">
                    This will not migrate your component. You will need to do
                    that manually.
                  </Text>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      <Text variant="bold">Display name*</Text>
                      {typeof formik.errors.sliceName === "string" ? (
                        <Text variant="small" color="tomato10">
                          {formik.errors.sliceName}
                        </Text>
                      ) : null}
                    </label>
                    <FormInput
                      placeholder={`Pascalised Slice API ID (e.g. ${pascalize(
                        slice.key
                      )})`}
                      error={typeof formik.errors.sliceName === "string"}
                      value={formik.values.sliceName}
                      onValueChange={(value) =>
                        void formik.setFieldValue(
                          "sliceName",
                          value.slice(0, 30)
                        )
                      }
                      data-cy="slice-name-input"
                    />
                    <Text variant="normal" color="grey11">
                      A display name for the slice
                    </Text>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      <Text variant="bold">Slice library*</Text>
                      {typeof formik.errors.from === "string" ? (
                        <Text variant="small" color="tomato10">
                          {formik.errors.from}
                        </Text>
                      ) : null}
                    </label>
                    <Select
                      size="medium"
                      variant="secondary"
                      startIcon="folder"
                      flexContent={true}
                      value={formik.values.from}
                      onValueChange={(value) =>
                        value ? void formik.setFieldValue("from", value) : null
                      }
                    >
                      {libraries.map((library) => (
                        <SelectItem key={library.name} value={library.name}>
                          {library.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Text variant="normal" color="grey11">
                      The library where we'll store your slice
                    </Text>
                  </div>
                </ScrollArea>
                <DialogActions
                  ok={{
                    text: "Upgrade",
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
