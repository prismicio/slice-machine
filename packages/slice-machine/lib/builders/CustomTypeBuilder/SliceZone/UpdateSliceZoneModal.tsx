import { ComponentUI } from "@lib/models/common/ComponentUI";
import ModalFormCard from "../../../../components/ModalFormCard";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";

interface UpdateSliceModalProps {
  isOpen: boolean;
  formId: string;
  close: () => void;
  onSubmit: (values: SliceZoneFormValues) => void;
  availableSlices: ReadonlyArray<ComponentUI>;
  slicesInSliceZone: ReadonlyArray<ComponentUI>;
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
  slicesInSliceZone,
}) => {
  return (
    <ModalFormCard
      buttonLabel="Apply"
      isOpen={isOpen}
      formId={formId}
      close={close}
      onSubmit={(values: SliceZoneFormValues) => {
        onSubmit(values);
        close();
      }}
      initialValues={{
        sliceKeys: slicesInSliceZone.map((slice) => slice.model.id),
      }}
      content={{
        title: "Update slices",
      }}
      dataCy="update-slices-modal"
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
