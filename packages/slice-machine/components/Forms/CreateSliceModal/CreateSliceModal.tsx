import { Box, Label } from "theme-ui";
import { FC, useState } from "react";
import Select from "react-select";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { SliceSM } from "@lib/models/common/Slice";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import ModalFormCard from "@components/ModalFormCard";
import { createSlice } from "@src/features/slices/actions/createSlice";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { getState } from "@src/apiClient";

import { validateSliceModalValues } from "../formsValidator";
import { InputBox } from "../components/InputBox";

type CreateSliceModalProps = {
  onClose: () => void;
  onSuccess: (
    newSlice: SharedSlice,
    libraryName: string,
  ) => Promise<void> | void;
  localLibraries: readonly LibraryUI[];
  remoteSlices: ReadonlyArray<SliceSM>;
};

type FormValues = { sliceName: string; from: string };

export const CreateSliceModal: FC<CreateSliceModalProps> = ({
  onClose,
  onSuccess,
  localLibraries,
  remoteSlices,
}) => {
  const { createSliceSuccess } = useSliceMachineActions();
  const [isCreatingSlice, setIsCreatingSlice] = useState(false);

  const onSubmit = async (values: FormValues) => {
    const sliceName = values.sliceName;
    const libraryName = values.from;

    setIsCreatingSlice(true);

    await createSlice({
      sliceName,
      libraryName,
      onSuccess: async (newSlice) => {
        // TODO(DT-1453): Remove the need of the global getState
        const serverState = await getState();
        // Update Redux store
        createSliceSuccess(serverState.libraries);

        await onSuccess(newSlice, libraryName);
      },
    });
  };

  return (
    <ModalFormCard
      dataCy="create-slice-modal"
      isOpen
      widthInPx="530px"
      isLoading={isCreatingSlice}
      formId="create-new-slice"
      close={onClose}
      buttonLabel="Create"
      onSubmit={(values) => {
        void onSubmit(values);
      }}
      initialValues={{
        sliceName: "",
        from: localLibraries[0].name,
      }}
      validate={(values) =>
        validateSliceModalValues(values, localLibraries, remoteSlices)
      }
      content={{
        title: "Create a new slice",
      }}
    >
      {({ touched, values, setFieldValue, errors }) => (
        <Box>
          <InputBox
            name="sliceName"
            label="Slice Name"
            placeholder="Pascalised Slice API ID (e.g. TextBlock)"
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            error={touched.sliceName ? errors.sliceName : undefined}
            dataCy="slice-name-input"
          />
          <Label htmlFor="from" sx={{ mb: 2 }}>
            Target Library
          </Label>
          <Select
            name="from"
            options={localLibraries.map((v) => ({
              value: v.name,
              label: v.name,
            }))}
            onChange={(v: { label: string; value: string } | null) =>
              v ? void setFieldValue("from", v.value) : null
            }
            defaultValue={{ value: values.from, label: values.from }}
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
        </Box>
      )}
    </ModalFormCard>
  );
};
