import { FieldArray } from "formik";

import Grid from "@components/Grid";
import { SliceZoneFormValues } from "./UpdateSliceZoneModal";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { SharedSliceSelectionCard } from "@src/features/slices/sliceCards/SharedSliceSelectionCard";

const UpdateSliceZoneModalList: React.FC<{
  availableSlices: ReadonlyArray<ComponentUI>;
  values: SliceZoneFormValues;
  isSliceTemplate: boolean;
  placeholderSlices?: ReadonlyArray<ComponentUI>;
}> = ({ availableSlices, values, isSliceTemplate, placeholderSlices }) => (
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
            <SharedSliceSelectionCard
              isComingSoon={isComingSoon}
              isSliceTemplate={isSliceTemplate}
              onSelectedChange={(selected) => {
                if (selected) {
                  arrayHelpers.push(slice.model.id);
                } else {
                  arrayHelpers.remove(values.sliceKeys.indexOf(slice.model.id));
                }
              }}
              selected={isInSliceZone}
              slice={slice}
            />
          );
        }}
      />
    )}
  />
);

export default UpdateSliceZoneModalList;
