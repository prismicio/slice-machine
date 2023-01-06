import { Box, Label } from "theme-ui";

import Select from "react-select";

import ModalFormCard from "@components/ModalFormCard";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";
import { InputBox } from "./components/InputBox";
import { RESERVED_SLICE_NAME } from "@lib/consts";
import { SliceSM } from "@slicemachine/core/build/models";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { API_ID_REGEX } from "@lib/consts";

const formId = "create-new-slice";

type CreateSliceModalProps = {
  isOpen: boolean;
  isCreatingSlice: boolean;
  onSubmit: ({ sliceName, from }: { sliceName: string; from: string }) => void;
  close: () => void;
  libraries: readonly LibraryUI[];
  remoteSlices: ReadonlyArray<SliceSM>;
};

type FormValues = { sliceName: string; from: string };

const CreateSliceModal: React.FunctionComponent<CreateSliceModalProps> = ({
  isOpen,
  isCreatingSlice,
  onSubmit,
  close,
  libraries,
  remoteSlices,
}) => {
  return (
    <ModalFormCard
      dataCy="create-slice-modal"
      isOpen={isOpen}
      widthInPx="530px"
      isLoading={isCreatingSlice}
      formId={formId}
      close={close}
      buttonLabel="Create"
      onSubmit={(values: FormValues) => {
        onSubmit(values);
        close();
      }}
      initialValues={{
        sliceName: "",
        from: libraries[0].name,
      }}
      validate={({ sliceName }) => {
        if (!sliceName) {
          return { sliceName: "Cannot be empty" };
        }
        if (!API_ID_REGEX.exec(sliceName)) {
          return { sliceName: "No special characters allowed" };
        }
        const cased = startCase(camelCase(sliceName)).replace(/\s/gm, "");
        if (cased !== sliceName.trim()) {
          return { sliceName: "Value has to be PascalCased" };
        }
        // See: #599
        if (sliceName.match(/^\d/)) {
          return { sliceName: "Value cannot start with a number" };
        }
        if (RESERVED_SLICE_NAME.includes(sliceName)) {
          return {
            sliceName: `${sliceName} is reserved for Slice Machine use`,
          };
        }

        const localNames = libraries.flatMap((lib) =>
          lib.components.map((slice) => slice.model.name)
        );
        const remoteNames = remoteSlices.map((slice) => slice.name);
        const usedNames = [...localNames, ...remoteNames];

        if (usedNames.includes(sliceName)) {
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
            placeholder="Pascalised Slice API ID (e.g. TextBlock)"
            error={touched.sliceName ? errors.sliceName : undefined}
            dataCy="slice-name-input"
          />
          <Label htmlFor="origin" sx={{ mb: 2 }}>
            Target Library
          </Label>
        </Box>
      )}
    </ModalFormCard>
  );
};

export default CreateSliceModal;
