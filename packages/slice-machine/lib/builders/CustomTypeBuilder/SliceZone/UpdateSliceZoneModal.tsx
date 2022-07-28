import ModalFormCard from "../../../../components/ModalFormCard";

import UpdateSliceZoneModalEmptyState from "./UpdateSliceZoneModalEmptyState";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";
import { ComponentUI } from "@lib/models/common/ComponentUI";

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
  const projectHasAvailableSlices = !!availableSlices.length;

  return (
    <ModalFormCard
      widthInPx={projectHasAvailableSlices ? undefined : "500px"}
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
