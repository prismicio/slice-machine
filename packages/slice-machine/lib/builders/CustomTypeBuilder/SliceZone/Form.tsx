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
  close: () => void;
  onSubmit: Function;
  availableSlices: ReadonlyArray<SliceState>;
  slicesInSliceZone: ReadonlyArray<SliceState>;
}) => {
  return (
    <ModalFormCard
      isOpen={isOpen}
      formId={formId}
      close={() => close()}
      onSubmit={(values: any) => onSubmit(values)}
      initialValues={{
        sliceKeys: slicesInSliceZone.map((slice) => slice.infos.meta.id),
      }}
      content={{
        title: "Update SliceZone",
      }}
    >
      {({ values }: { values: { sliceKeys: any } }) => (
        <FieldArray
          name="sliceKeys"
          render={(arrayHelpers) => {
            return (
              <Grid
                gridTemplateMinPx="200px"
                elems={availableSlices}
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
                      children: any;
                    }) => {
                      return (
                        <div
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            const isInSliceZone = values.sliceKeys.includes(
                              slice.infos.meta.id
                            );
                            if (isInSliceZone) {
                              return arrayHelpers.remove(
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
