import ModalFormCard from "../../../../components/ModalFormCard";

import SliceState from "@lib/models/ui/SliceState";
import UpdateSliceZoneModalEmptyState from "./UpdateSliceZoneModalEmptyState";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";

interface UpdateSliceModalProps {
  isOpen: boolean;
  formId: string;
  close: () => void;
  onSubmit: (values: SliceZoneFormValues) => void;
  availableSlices: ReadonlyArray<SliceState>;
  slicesInSliceZone: ReadonlyArray<SliceState>;
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
  const projectHasAvailableSlices = !!availableSlices.length;

  return (
    <ModalFormCard
      widthInPx={projectHasAvailableSlices ? undefined : "500px"}
      isOpen={isOpen}
      formId={formId}
      close={close}
      onSubmit={(values: SliceZoneFormValues) => onSubmit(values)}
      initialValues={{
        sliceKeys: slicesInSliceZone.map((slice) => slice.model.id),
      }}
      content={{
        title: "Update Slice Zone",
      }}
      omitFooter={!projectHasAvailableSlices}
    >
      {projectHasAvailableSlices
        ? ({ values }) => (
            <UpdateSliceZoneModalList
              values={values}
              availableSlices={availableSlices}
            />
          )
        : () => <UpdateSliceZoneModalEmptyState />}
    </ModalFormCard>
  );
};

export default UpdateSliceZoneModal;
