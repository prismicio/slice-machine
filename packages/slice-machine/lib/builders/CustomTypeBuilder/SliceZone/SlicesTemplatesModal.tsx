import { FC } from "react";
import { Text } from "theme-ui";

import { SliceTemplate } from "@src/features/slicesTemplates/useSlicesTemplates";
import { Slices } from "@lib/models/common/Slice";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";
import ModalFormCard from "../../../../components/ModalFormCard";
import { sliceTemplatesComingSoon } from "./sliceTemplatesComingSoon";

interface UpdateSliceModalProps {
  isOpen: boolean;
  formId: string;
  close: () => void;
  onSubmit: (values: SliceZoneFormValues) => void;
  availableSlicesTemplates: SliceTemplate[];
}

export type SliceZoneFormValues = {
  sliceKeys: string[];
};

export const SlicesTemplatesModal: FC<UpdateSliceModalProps> = ({
  isOpen,
  formId,
  close,
  onSubmit,
  availableSlicesTemplates,
}) => {
  return (
    <ModalFormCard
      buttonLabel="Add"
      isOpen={isOpen}
      formId={formId}
      close={close}
      onSubmit={(values: SliceZoneFormValues) => {
        onSubmit(values);
      }}
      initialValues={{
        sliceKeys: [],
      }}
      content={{
        title: "Add from templates",
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
                  {}
                ),
              })
            ),
            ...sliceTemplatesComingSoon,
          ]}
        />
      )}
    </ModalFormCard>
  );
};
