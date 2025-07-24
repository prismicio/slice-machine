import { FieldArray } from "formik";

import { SharedSliceCard } from "@/features/slices/sliceCards/SharedSliceCard";
import Grid from "@/legacy/components/Grid";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

import { SliceZoneFormValues } from "./UpdateSliceZoneModal";

const UpdateSliceZoneModalList: React.FC<{
  availableSlices: ReadonlyArray<ComponentUI>;
  values: SliceZoneFormValues;
}> = ({ availableSlices, values }) => (
  <FieldArray
    name="sliceKeys"
    render={(arrayHelpers) => (
      <Grid
        gridTemplateMinPx="200px"
        elems={availableSlices}
        defineElementKey={(slice) => `${slice.from}-${slice.model.name}`}
        renderElem={(slice) => {
          const isInSliceZone = values.sliceKeys.includes(slice.model.id);
          return (
            <SharedSliceCard
              action={{ type: "checkbox" }}
              mode="selection"
              onSelectedChange={(selected) => {
                if (selected) {
                  arrayHelpers.push(slice.model.id);
                } else {
                  arrayHelpers.remove(values.sliceKeys.indexOf(slice.model.id));
                }
              }}
              selected={isInSliceZone}
              slice={slice}
              variant="outlined"
            />
          );
        }}
      />
    )}
  />
);

export default UpdateSliceZoneModalList;
