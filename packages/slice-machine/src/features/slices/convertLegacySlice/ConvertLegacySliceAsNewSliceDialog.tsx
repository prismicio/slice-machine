import { useOnChange } from "@prismicio/editor-support/React";
import {
  Box,
  Dialog,
  DialogActionButton,
  DialogActions,
  DialogCancelButton,
  DialogContent,
  DialogHeader,
  Form,
  FormInput,
  ScrollArea,
  Select,
  SelectItem,
  Text,
} from "@prismicio/editor-ui";
import { type FC, useState } from "react";
import { useSelector } from "react-redux";

import {
  SliceModalValuesValidity,
  validateSliceModalValues as validateAsNewSliceValues,
} from "@/legacy/components/Forms/formsValidator";
import { pascalize } from "@/legacy/lib/utils/str";
import { getRemoteSlices } from "@/modules/slices";
import { SliceMachineStoreType } from "@/redux/type";

import styles from "./ConvertLegacySliceButton.module.css";
import { DialogProps } from "./types";

type FormValues = {
  from: string;
  sliceName: string;
};

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

  const defaultValues = {
    from: libraries[0]?.name,
    sliceName: pascalize(slice.key),
  };

  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<SliceModalValuesValidity>();

  useOnChange(isOpen, () => {
    if (!isOpen) {
      setValues(defaultValues);
      setErrors(undefined);
    }
  });

  function handleValueChange(values: FormValues) {
    setValues(values);
    setErrors(validateAsNewSliceValues(values, libraries, remoteSlices));
  }

  function handleSubmit() {
    if (errors && Object.keys(errors).length > 0) {
      return;
    }

    onSubmit({ libraryID: values.from, sliceID: values.sliceName });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      size={{ width: 448, height: "auto" }}
    >
      <DialogHeader title="Upgrade slice" />
      <DialogContent>
        <Form onSubmit={handleSubmit}>
          <Box flexDirection="column">
            <ScrollArea className={styles.scrollArea}>
              <Text variant="normal" color="grey11">
                This will create a new slice with the same fields. The new slice
                will replace the legacy slice in all of your types, and the
                existing slice content will be re-mapped to the new slice.
              </Text>
              <Text variant="normal" color="grey11">
                This will not migrate your component. You will need to do that
                manually.
              </Text>
              <Box flexDirection="column" gap={4}>
                <FormInput
                  label="Slice name *"
                  placeholder={`Pascalised Slice API ID (e.g. ${pascalize(
                    slice.key,
                  )})`}
                  error={errors?.sliceName}
                  value={values.sliceName}
                  onValueChange={(value) =>
                    handleValueChange({
                      ...values,
                      sliceName: value.slice(0, 30),
                    })
                  }
                  data-testid="slice-name-input"
                />
                <Text variant="normal" color="grey11">
                  A display name for the slice
                </Text>
              </Box>
              <Box flexDirection="column" gap={4}>
                <label className={styles.label}>
                  <Text variant="bold">Slice library *</Text>
                </label>
                <Select
                  size="medium"
                  color="grey"
                  startIcon="folder"
                  flexContent={true}
                  value={values.from}
                  onValueChange={(value) => {
                    if (value) handleValueChange({ ...values, from: value });
                  }}
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
            <DialogActions>
              <DialogCancelButton size="medium" />
              <DialogActionButton
                size="medium"
                loading={isLoading}
                disabled={errors && Object.keys(errors).length > 0}
              >
                Upgrade
              </DialogActionButton>
            </DialogActions>
          </Box>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
