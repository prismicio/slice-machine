import ModalFormCard from "../../../../components/ModalFormCard";

import UpdateSliceZoneModalEmptyState from "./UpdateSliceZoneModalEmptyState";
import UpdateSliceZoneModalList from "./UpdateSliceZoneModalList";
import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";

interface UpdateSliceModalProps {
  isOpen: boolean;
  formId: string;
  close: () => void;
  onSubmit: (values: SliceZoneFormValues) => void;
  availableSlices: ReadonlyArray<ExtendedComponentUI>;
  slicesInSliceZone: ReadonlyArray<ExtendedComponentUI>;
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
        sliceKeys: slicesInSliceZone.map((slice) => slice.component.model.id),
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
