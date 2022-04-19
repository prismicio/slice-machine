import { Box, Label } from "theme-ui";

import Select from "react-select";

import ModalFormCard from "@components/ModalFormCard";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";
import { InputBox } from "./components/InputBox";
import { RESERVED_SLICE_NAME } from "@lib/consts";
import { LibraryUI } from "@lib/models/common/LibraryUI";
const formId = "create-new-slice";

type CreateSliceModalProps = {
  isOpen: boolean;
  isCreatingSlice: boolean;
  onSubmit: ({ sliceName, from }: { sliceName: string; from: string }) => void;
  close: () => void;
  libraries: ReadonlyArray<LibraryUI>;
};

type FormValues = { sliceName: string; from: string };

const CreateSliceModal: React.FunctionComponent<CreateSliceModalProps> = ({
  isOpen,
  isCreatingSlice,
  onSubmit,
  close,
  libraries,
}) => {
  return (
    <ModalFormCard
      dataCy={"create-slice-modal"}
      isOpen={isOpen}
      widthInPx="530px"
      isLoading={isCreatingSlice}
      formId={formId}
      close={close}
      buttonLabel="Create"
      onSubmit={(values: FormValues) => onSubmit(values)}
      initialValues={{
        sliceName: "",
        from: libraries[0].name,
      }}
      validate={({ sliceName, from }) => {
        if (!sliceName) {
          return { sliceName: "Cannot be empty" };
        }
        if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.exec(sliceName)) {
          return { sliceName: "No special characters allowed" };
        }
        const cased = startCase(camelCase(sliceName)).replace(/\s/gm, "");
        if (cased !== sliceName.trim()) {
          return { sliceName: "Value has to be PascalCased" };
        }
        if (RESERVED_SLICE_NAME.includes(sliceName)) {
          return {
            sliceName: `${sliceName} is reserved for Slice Machine use`,
          };
        }

        const usedNamesInLib = libraries.reduce((acc, lib) => {
          if (lib.name !== from) return acc;
          return lib.components.map((slice) => slice.model.name);
        }, [] as string[]);

        if (usedNamesInLib.includes(sliceName)) {
          return { sliceName: "Slice name is already taken." };
        }
      }}
      content={{
        title: "Create a new slice",
      }}
    >
      {({ touched, values, setFieldValue, errors }) => (
        <Box>
          <InputBox
            name="sliceName"
            label="Slice Name"
            placeholder="MySlice"
            error={touched.sliceName ? errors.sliceName : undefined}
            dataCy={"slice-name-input"}
          />
          <Label htmlFor="origin" sx={{ mb: 2 }}>
            Target Library
          </Label>
          <Select
            name="origin"
            options={libraries.map((v) => ({ value: v.name, label: v.name }))}
            onChange={(v: { label: string; value: string } | null) =>
              v ? setFieldValue("from", v.value) : null
            }
            defaultValue={{ value: values.from, label: values.from }}
            theme={(theme) => {
              return {
                ...theme,
                colors: {
                  ...theme.colors,
                  text: "text",
                  primary: "background",
                },
              };
            }}
          />
        </Box>
      )}
    </ModalFormCard>
  );
};

export default CreateSliceModal;
