import { FieldArray } from "formik";
import { Checkbox } from "theme-ui";

import { SharedSlice } from "@lib/models/ui/Slice";

import Grid from "@components/Grid";
import { SliceZoneFormValues } from "./UpdateSliceZoneModal";
import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";
import { ComponentUI } from "@lib/models/common/ComponentUI";

const UpdateSliceZoneModalList: React.FC<{
  availableSlices: ReadonlyArray<ExtendedComponentUI>;
  values: SliceZoneFormValues;
}> = ({ availableSlices, values }) => (
  <FieldArray
    name="sliceKeys"
    render={(arrayHelpers) => (
      <Grid
        gridTemplateMinPx="200px"
        elems={availableSlices}
        defineElementKey={(slice: ExtendedComponentUI) =>
          slice.component.model.name
        }
        renderElem={(slice: ExtendedComponentUI) => {
          return SharedSlice.render({
            bordered: true,
            displayStatus: false,
            thumbnailHeightPx: "220px",
            slice: slice.component,
            Wrapper: ({
              slice,
              children,
            }: {
              slice: ComponentUI;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              children: any;
            }) => {
              return (
                <div
                  data-testid="slicezone-modal-item"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    const isInSliceZone = values.sliceKeys.includes(
                      slice.model.id
                    );
                    if (isInSliceZone) {
                      return arrayHelpers.remove(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                        values.sliceKeys.indexOf(slice.model.id)
                      );
                    }
                    arrayHelpers.push(slice.model.id);
                  }}
                  key={`${slice.from}-${slice.model.name}`}
                >
                  {children}
                </div>
              );
            },
            CustomStatus: ({ slice }: { slice: ComponentUI }) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              const isInSliceZone = values.sliceKeys.includes(slice.model.id);
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
