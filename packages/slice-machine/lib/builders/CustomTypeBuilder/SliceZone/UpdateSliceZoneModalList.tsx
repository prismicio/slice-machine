import { FieldArray } from "formik";
import { Checkbox, Box, Text } from "theme-ui";

import { SharedSlice } from "@lib/models/ui/Slice";

import Grid from "@components/Grid";
import { SliceZoneFormValues } from "./UpdateSliceZoneModal";
import { ComponentUI } from "@lib/models/common/ComponentUI";

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
        defineElementKey={(slice: ComponentUI) => slice.model.name}
        renderElem={(slice: ComponentUI) => {
          const isPlaceholderSlice = placeholderSlices?.find(
            (s) => s.model.id === slice.model.id
          );

          return SharedSlice.render({
            slice: slice,
            Wrapper: ({ slice, children, sx }) => {
              return (
                <Box
                  data-testid="slicezone-modal-item"
                  onClick={() => {
                    if (isPlaceholderSlice) {
                      return;
                    }

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
                  sx={
                    !isPlaceholderSlice
                      ? {
                          cursor: "pointer",
                          ...sx,
                        }
                      : {
                          opacity: 0.5,
                          ...sx,
                        }
                  }
                >
                  {children}
                </Box>
              );
            },
            StatusOrCustom: ({ slice }: { slice: ComponentUI }) => {
              if (isPlaceholderSlice) {
                return (
                  <Text
                    sx={{
                      fontSize: 12,
                      color: "purpleStrong",
                      fontWeight: "bold",
                    }}
                  >
                    Coming soon
                  </Text>
                );
              }

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
