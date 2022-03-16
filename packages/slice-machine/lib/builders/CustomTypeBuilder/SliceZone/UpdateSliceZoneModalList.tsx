import { FieldArray } from "formik";
import { Checkbox } from "theme-ui";

import SliceState from "@lib/models/ui/SliceState";
import { SharedSlice } from "@lib/models/ui/Slice";

import Grid from "@components/Grid";
import { SliceZoneFormValues } from "./UpdateSliceZoneModal";

const UpdateSliceZoneModalList: React.FC<{
  availableSlices: ReadonlyArray<SliceState>;
  values: SliceZoneFormValues;
}> = ({ availableSlices, values }) => (
  <FieldArray
    name="sliceKeys"
    render={(arrayHelpers) => (
      <Grid
        gridTemplateMinPx="200px"
        elems={availableSlices}
        defineElementKey={(slice: SliceState) => slice.model.name}
        renderElem={(slice: SliceState) => {
          return SharedSlice.render({
            bordered: true,
            displayStatus: false,
            thumbnailHeightPx: "220px",
            slice,
            Wrapper: ({
              slice,
              children,
            }: {
              slice: SliceState;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              children: any;
            }) => {
              return (
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    const isInSliceZone = values.sliceKeys.includes(
                      slice.infos.meta.id
                    );
                    if (isInSliceZone) {
                      return arrayHelpers.remove(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                        values.sliceKeys.indexOf(slice.infos.meta.id)
                      );
                    }
                    arrayHelpers.push(slice.infos.meta.id);
                  }}
                  key={`${slice.from}-${slice.model.name}`}
                >
                  {children}
                </div>
              );
            },
            CustomStatus: ({ slice }: { slice: SliceState }) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              const isInSliceZone = values.sliceKeys.includes(
                slice.infos.meta.id
              );
              return isInSliceZone ? (
                <Checkbox value="true" defaultChecked />
              ) : (
                <Checkbox value="false" />
              );
            },
          });
        }}
      />
    )}
  />
);

export default UpdateSliceZoneModalList;
