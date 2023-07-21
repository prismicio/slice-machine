import { Box, Label } from "theme-ui";
import { FC, useState } from "react";
import Select from "react-select";
import { useRouter } from "next/router";

import { CustomTypeSM, CustomTypes } from "@lib/models/common/CustomType";
import { SliceSM } from "@lib/models/common/Slice";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import ModalFormCard from "@components/ModalFormCard";
import { createSlice } from "@src/features/slices/actions/createSlice";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { getState } from "@src/apiClient";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { managerClient } from "@src/managerClient";
import { validateSliceModalValues } from "../formsValidator";
import { InputBox } from "../components/InputBox";
import { SLICES_CONFIG } from "@src/features/slices/slicesConfig";

type CreateSliceModalProps = {
  onClose: () => void;
  localLibraries: readonly LibraryUI[];
  remoteSlices: ReadonlyArray<SliceSM>;
  customType?: CustomTypeSM;
  tabId?: string;
};

type FormValues = { sliceName: string; from: string };

export const CreateSliceModal: FC<CreateSliceModalProps> = ({
  onClose,
  localLibraries,
  remoteSlices,
  customType,
  tabId,
}) => {
  const router = useRouter();
  const { createSliceSuccess, saveCustomTypeSuccess } =
    useSliceMachineActions();
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

        // When creating a slice from a custom type, we add it directly to the slice zone and save
        if (customType) {
          const newCustomType = {
            ...customType,
            tabs: customType.tabs.map((tab) =>
              tab.key === tabId && tab.sliceZone
                ? {
                    ...tab,
                    sliceZone: {
                      key: tab.sliceZone.key,
                      value: [
                        ...tab.sliceZone.value,
                        {
                          key: newSlice.id,
                          value: newSlice,
                        },
                      ],
                    },
                  }
                : tab
            ),
          };
          await managerClient.customTypes.updateCustomType({
            model: CustomTypes.fromSM(newCustomType),
          });
          saveCustomTypeSuccess(CustomTypes.fromSM(newCustomType));
        }

        // Redirect to the slice page
        const variationId = newSlice.variations[0].id;
        const sliceLocation = SLICES_CONFIG.getBuilderPagePathname({
          libraryName,
          sliceName,
          variationId,
        });
        void router.push(sliceLocation);
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
      actionMessage={
        customType
          ? CUSTOM_TYPES_MESSAGES[customType.format]
              .createSliceFromTypeActionMessage
          : undefined
      }
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
