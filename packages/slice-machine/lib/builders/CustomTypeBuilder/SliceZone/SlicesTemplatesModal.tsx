import { FC } from "react";
import { Text } from "theme-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { SliceTemplate } from "@src/features/slicesTemplates/useSlicesTemplates";
import { Slices } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { createSlicesTemplates } from "@src/features/slicesTemplates/actions/createSlicesTemplates";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { getState } from "@src/apiClient";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { managerClient } from "@src/managerClient";

import ModalFormCard from "../../../../components/ModalFormCard";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";
import { sliceTemplatesComingSoon } from "./sliceTemplatesComingSoon";

interface UpdateSliceModalProps {
  formId: string;
  close: () => void;
  onSuccess: (slices: SharedSlice[]) => Promise<void>;
  availableSlicesTemplates: SliceTemplate[];
  localLibraries: readonly LibraryUI[];
}

export type SliceZoneFormValues = {
  sliceKeys: string[];
};

export const SlicesTemplatesModal: FC<UpdateSliceModalProps> = ({
  formId,
  close,
  onSuccess,
  availableSlicesTemplates,
  localLibraries,
}) => {
  const { createSliceSuccess } = useSliceMachineActions();

  return (
    <ModalFormCard
      isOpen
      buttonLabel="Add"
      formId={formId}
      close={close}
      onSubmit={(values: SliceZoneFormValues) => {
        const { sliceKeys } = values;

        void createSlicesTemplates({
          templateIDs: sliceKeys,
          localLibrariesNames: localLibraries.map((library) => library.name),
          onSuccess: async (slicesIds: string[]) => {
            // TODO(DT-1453): Remove the need of the global getState
            const serverState = await getState();

            // Update Redux store
            createSliceSuccess(serverState.libraries);

            const slices: SharedSlice[] = await Promise.all(
              slicesIds
                .map(async (sliceId) => {
                  const slice = await managerClient.slices.readSlice({
                    libraryID: localLibraries[0].name,
                    sliceID: sliceId,
                  });
                  return slice.model;
                })
                .filter(
                  (slice) => slice !== undefined,
                ) as Promise<SharedSlice>[],
            );

            await onSuccess(slices);
          },
        });
      }}
      initialValues={{
        sliceKeys: [],
      }}
      content={{
        title: "Use template slices",
      }}
      validate={(values) => {
        if (values.sliceKeys.length === 0) {
          return {
            sliceKeys: "Select at least one template to add",
          };
        }
      }}
      actionMessage={({ errors }) =>
        errors.sliceKeys !== undefined ? (
          <Text sx={{ color: "error" }}>{errors.sliceKeys}</Text>
        ) : undefined
      }
    >
      {({ values }) => (
        <UpdateSliceZoneModalList
          values={values}
          placeholderSlices={sliceTemplatesComingSoon}
          availableSlices={[
            ...availableSlicesTemplates.map(
              (slice): ComponentUI => ({
                extension: "",
                fileName: "",
                from: "",
                href: "",
                pathToSlice: "",
                model: Slices.toSM(slice.model),
                screenshots: Object.entries(slice.screenshots).reduce(
                  (acc, curr) => ({
                    ...acc,
                    [curr[0]]: {
                      url: curr[1],
                    },
                  }),
                  {},
                ),
              }),
            ),
            ...sliceTemplatesComingSoon,
          ]}
        />
      )}
    </ModalFormCard>
  );
};
