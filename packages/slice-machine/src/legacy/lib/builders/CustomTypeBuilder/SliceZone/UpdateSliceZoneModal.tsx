import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { Text } from "theme-ui";

import { useSectionsNamingExperiment } from "@/features/builder/useSectionsNamingExperiment";
import ModalFormCard from "@/legacy/components/ModalFormCard";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { pluralize } from "@/utils/textConversion";

import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";

interface UpdateSliceModalProps {
  formId: string;
  close: () => void;
  onSubmit: (slices: SharedSlice[]) => void;
  availableSlices: ReadonlyArray<ComponentUI>;
}

export type SliceZoneFormValues = {
  sliceKeys: string[];
};

const UpdateSliceZoneModal: React.FC<UpdateSliceModalProps> = ({
  formId,
  close,
  onSubmit,
  availableSlices,
}) => {
  const sectionsNamingExperiment = useSectionsNamingExperiment();

  return (
    <ModalFormCard
      isOpen
      buttonLabel="Add"
      formId={formId}
      close={close}
      onSubmit={(values: SliceZoneFormValues) => {
        const { sliceKeys } = values;
        const slices = sliceKeys
          .map(
            (sliceKey) =>
              availableSlices.find((s) => s.model.id === sliceKey)?.model,
          )
          .filter((slice) => slice !== undefined) as SharedSlice[];
        onSubmit(slices);
      }}
      initialValues={{
        sliceKeys: [],
      }}
      content={{
        title: `Select existing ${pluralize(sectionsNamingExperiment.value)}`,
      }}
      testId="update-slices-modal"
      validate={(values) => {
        if (values.sliceKeys.length === 0) {
          return {
            sliceKeys: "Select at least one slice to add",
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
          availableSlices={availableSlices}
        />
      )}
    </ModalFormCard>
  );
};

export default UpdateSliceZoneModal;
