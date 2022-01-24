import { Box, Label } from "theme-ui";

import Select from "react-select";

import ModalFormCard from "@components/ModalFormCard";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";
import { InputBox } from "./components/InputBox";

const formId = "create-new-slice";

type CreateSliceModalProps = {
  isOpen: boolean;
  onSubmit: ({ sliceName, from }: { sliceName: string; from: string }) => void;
  close: () => void;
  libraries: ReadonlyArray<{ name: string }>;
};

type FormValues = { sliceName: string; from: string };

interface ModalInternalProps {
  errors: { sliceName?: string };
  touched: { sliceName?: string };
  values: FormValues;
  setFieldValue: (key: string, value: string) => void;
}

const CreateSliceModal: React.FunctionComponent<CreateSliceModalProps> = ({
  isOpen,
  onSubmit,
  close,
  libraries,
}) => (
  <ModalFormCard
    dataCy={"create-slice-modal"}
    isOpen={isOpen}
    widthInPx="530px"
    formId={formId}
    close={() => close()}
    onSubmit={(values: FormValues) => onSubmit(values)}
    initialValues={{
      sliceName: "",
      from: libraries[0].name,
    }}
    validate={({ sliceName }: { sliceName: string }) => {
      if (!sliceName) {
        return { sliceName: "Cannot be empty" };
      }
      if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.exec(sliceName)) {
        return { sliceName: "No special character allowed" };
      }
      const cased = startCase(camelCase(sliceName)).replace(/\s/gm, "");
      if (cased !== sliceName.trim()) {
        return { sliceName: "Value has to be PascalCased" };
      }
    }}
    content={{
      title: "Create a new slice",
    }}
  >
    {({ touched, values, setFieldValue, errors }: ModalInternalProps) => (
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

export default CreateSliceModal;
