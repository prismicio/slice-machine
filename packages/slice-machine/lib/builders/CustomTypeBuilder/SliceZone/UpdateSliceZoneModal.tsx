import { Text } from "theme-ui";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import ModalFormCard from "../../../../components/ModalFormCard";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";

interface UpdateSliceModalProps {
  isOpen: boolean;
  formId: string;
  close: () => void;
  onSubmit: (values: SliceZoneFormValues) => void;
  availableSlices: ReadonlyArray<ComponentUI>;
}

export type SliceZoneFormValues = {
  sliceKeys: string[];
};

const UpdateSliceZoneModal: React.FC<UpdateSliceModalProps> = ({
  isOpen,
  formId,
  close,
  onSubmit,
  availableSlices,
}) => {
  return (
    <ModalFormCard
      buttonLabel="Add"
      isOpen={isOpen}
      formId={formId}
      close={close}
      onSubmit={(values: SliceZoneFormValues) => {
        onSubmit(values);
        close();
      }}
      initialValues={{
        sliceKeys: [],
      }}
      content={{
        title: "Add from library",
      }}
      dataCy="update-slices-modal"
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
