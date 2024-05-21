import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FormInput,
  ScrollArea,
  Select,
  SelectItem,
  Text,
} from "@prismicio/editor-ui";
import { Formik } from "formik";
import type { FC } from "react";
import { useSelector } from "react-redux";

import { validateSliceModalValues as validateAsNewSliceValues } from "@/legacy/components/Forms/formsValidator";
import { pascalize } from "@/legacy/lib/utils/str";
import { getRemoteSlices } from "@/modules/slices";
import { SliceMachineStoreType } from "@/redux/type";

import styles from "./ConvertLegacySliceButton.module.css";
import { DialogProps } from "./types";

export const ConvertLegacySliceAsNewSliceDialog: FC<DialogProps> = ({
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
          validateOnMount
          initialValues={{
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
            return (
              <form id="convert-legacy-slice-as-new-slice-dialog">
                <Box flexDirection="column">
                  <ScrollArea
                    className={styles.scrollArea}
                    style={{ width: 448 }}
                  >
                    <Text variant="normal" color="grey11">
                      This will create a new slice with the same fields. The new
                      slice will replace the legacy slice in all of your types,
                      and the existing slice content will be re-mapped to the
                      new slice.
                    </Text>
                    <Text variant="normal" color="grey11">
                      This will not migrate your component. You will need to do
                      that manually.
                    </Text>
                    <Box flexDirection="column" gap={4}>
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
                          slice.key,
                        )})`}
                        error={typeof formik.errors.sliceName === "string"}
                        value={formik.values.sliceName}
                        onValueChange={(value) =>
                          void formik.setFieldValue(
                            "sliceName",
                            value.slice(0, 30),
                          )
                        }
                        data-testid="slice-name-input"
                      />
                      <Text variant="normal" color="grey11">
                        A display name for the slice
                      </Text>
                    </Box>
                    <Box flexDirection="column" gap={4}>
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
                        color="grey"
                        startIcon="folder"
                        flexContent={true}
                        value={formik.values.from}
                        onValueChange={(value) =>
                          value
                            ? void formik.setFieldValue("from", value)
                            : null
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
                    </Box>
                  </ScrollArea>
                  <DialogActions
                    ok={{
                      text: "Upgrade",
                      onClick: () => void formik.submitForm(),
                      loading: isLoading,
                      disabled: !formik.isValid,
                    }}
                    cancel={{ text: "Cancel" }}
                    size="medium"
                  />
                </Box>
              </form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
