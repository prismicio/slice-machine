import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { FC } from "react";
import { Text } from "theme-ui";

import { getState } from "@/apiClient";
import { useSectionsNamingExperiment } from "@/features/builder/useSectionsNamingExperiment";
import { createSlicesTemplates } from "@/features/slicesTemplates/actions/createSlicesTemplates";
import { SliceTemplate } from "@/features/slicesTemplates/useSlicesTemplates";
import ModalFormCard from "@/legacy/components/ModalFormCard";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { LibraryUI } from "@/legacy/lib/models/common/LibraryUI";
import { Slices } from "@/legacy/lib/models/common/Slice";
import { managerClient } from "@/managerClient";
import useSliceMachineActions from "@/modules/useSliceMachineActions";
import { pluralize } from "@/utils/textConversion";

import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";

interface UpdateSliceModalProps {
  formId: string;
  close: () => void;
  onSuccess: (slices: SharedSlice[]) => void;
  availableSlicesTemplates: SliceTemplate[];
  localLibraries: readonly LibraryUI[];
  location: "custom_type" | "page_type";
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
  location,
}) => {
  const { createSliceSuccess } = useSliceMachineActions();
  const sectionsNamingExperiment = useSectionsNamingExperiment();

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
          location,
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

            onSuccess(slices);
          },
        });
      }}
      initialValues={{
        sliceKeys: [],
      }}
      content={{
        title: `Use template ${pluralize(sectionsNamingExperiment.value)}`,
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
          availableSlices={availableSlicesTemplates.map(
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
          )}
        />
      )}
    </ModalFormCard>
  );
};
