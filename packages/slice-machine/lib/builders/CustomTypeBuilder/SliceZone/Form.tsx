import { FieldArray } from "formik";
import { Checkbox } from "theme-ui";
import ModalFormCard from "../../../../components/ModalFormCard";

import SliceState from "@lib/models/ui/SliceState";
import { SharedSlice } from "@lib/models/ui/Slice";

import Grid from "@components/Grid";

const Form = ({
  isOpen,
  formId,
  close,
  onSubmit,
  availableSlices,
  slicesInSliceZone,
}: {
  isOpen: boolean;
  formId: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  close: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSubmit: Function;
  availableSlices: ReadonlyArray<SliceState>;
  slicesInSliceZone: ReadonlyArray<SliceState>;
}) => {
  return (
    <ModalFormCard
      isOpen={isOpen}
      formId={formId}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      close={() => close()}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      onSubmit={(values: any) => onSubmit(values)}
      initialValues={{
        sliceKeys: slicesInSliceZone.map((slice) => slice.infos.meta.id),
      }}
      content={{
        title: "Update SliceZone",
      }}
    >
      {({
        values,
      }: {
        values: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sliceKeys: any;
        };
      }) => (
        <FieldArray
          name="sliceKeys"
          render={(arrayHelpers) => {
            return (
              <Grid
                gridTemplateMinPx="200px"
                elems={availableSlices}
                defineElementKey={(slice: SliceState) => slice.infos.sliceName}
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
                          key={`${slice.from}-${slice.infos.sliceName}`}
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
            );
          }}
        />
      )}
    </ModalFormCard>
  );
};

export default Form;
