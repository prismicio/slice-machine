import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { FC, useState } from "react";
import Select from "react-select";
import { Box, Label } from "theme-ui";

import { getState } from "@/apiClient";
import { createSlice } from "@/features/slices/actions/createSlice";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import ModalFormCard from "@/legacy/components/ModalFormCard";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { SliceSM } from "@/legacy/lib/models/common/Slice";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import { InputBox } from "../components/InputBox";
import { validateSliceModalValues } from "../formsValidator";

type CreateSliceModalProps = {
  onClose: () => void;
  onSuccess: (newSlice: SharedSlice, libraryName: string) => void;
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
  const { syncChanges } = useAutoSync();

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
        onSuccess(newSlice, libraryName);
        syncChanges();
      },
    });
  };

  return (
    <ModalFormCard
      testId="create-slice-modal"
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
            testId="slice-name-input"
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
