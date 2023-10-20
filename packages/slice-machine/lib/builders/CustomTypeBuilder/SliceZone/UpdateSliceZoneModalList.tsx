import { FieldArray } from "formik";

import Grid from "@components/Grid";
import { SliceZoneFormValues } from "./UpdateSliceZoneModal";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SharedSliceCard } from "@src/features/slices/sliceCards/SharedSliceCard";

const UpdateSliceZoneModalList: React.FC<{
  availableSlices: ReadonlyArray<ComponentUI>;
  values: SliceZoneFormValues;
  placeholderSlices?: ReadonlyArray<ComponentUI>;
}> = ({ availableSlices, values, placeholderSlices }) => (
  <FieldArray
    name="sliceKeys"
    render={(arrayHelpers) => (
      <Grid
        gridTemplateMinPx="200px"
        elems={availableSlices}
        defineElementKey={(slice) => `${slice.from}-${slice.model.name}`}
        renderElem={(slice) => {
          const isComingSoon =
            placeholderSlices?.some((s) => s.model.id === slice.model.id) ??
            false;
          const isInSliceZone = values.sliceKeys.includes(slice.model.id);
          return (
            <SharedSliceCard
              action={{ type: "checkbox" }}
              isComingSoon={isComingSoon}
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
