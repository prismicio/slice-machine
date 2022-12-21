import { FieldArray } from "formik";
import { Checkbox, Box } from "theme-ui";

import { SharedSlice } from "@lib/models/ui/Slice";

import Grid from "@components/Grid";
import { SliceZoneFormValues } from "./UpdateSliceZoneModal";
import { ComponentUI } from "@lib/models/common/ComponentUI";

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
        defineElementKey={(slice: ComponentUI) => slice.model.name}
        renderElem={(slice: ComponentUI) => {
          return SharedSlice.render({
            slice: slice,
            Wrapper: ({ slice, children, sx }) => {
              return (
                <Box
                  data-testid="slicezone-modal-item"
                  onClick={() => {
                    const isInSliceZone = values.sliceKeys.includes(
                      slice.model.id
                    );
                    if (isInSliceZone) {
                      return arrayHelpers.remove(
                        values.sliceKeys.indexOf(slice.model.id)
                      );
                    }
                    arrayHelpers.push(slice.model.id);
                  }}
                  key={`${slice.from}-${slice.model.name}`}
                  sx={{
                    cursor: "pointer",
                    ...sx,
                  }}
                >
                  {children}
                </Box>
              );
            },
            StatusOrCustom: ({ slice }: { slice: ComponentUI }) => {
              const isInSliceZone = values.sliceKeys.includes(slice.model.id);

              return (
                <Checkbox
                  value={isInSliceZone ? "true" : "false"}
                  defaultChecked={isInSliceZone}
                  sx={{
                    mr: 0,
                  }}
                  data-cy={`check-${slice.model.id}`}
                />
              );
            },
          });
        }}
      />
    )}
  />
);

export default UpdateSliceZoneModalList;
