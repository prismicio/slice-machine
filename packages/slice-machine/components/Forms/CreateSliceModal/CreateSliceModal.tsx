import { Box, Label } from "theme-ui";

import Select from "react-select";
import ModalFormCard from "@components/ModalFormCard";
import { InputBox } from "../components/InputBox";
import { SliceSM } from "@lib/models/common/Slice";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { validateSliceModalValues } from "../formsValidator";

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

export const CreateSliceModal: React.FunctionComponent<
  CreateSliceModalProps
> = ({ isOpen, isCreatingSlice, onSubmit, close, libraries, remoteSlices }) => {
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
      validate={(values) =>
        validateSliceModalValues(values, libraries, remoteSlices)
      }
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
            menuPortalTarget={document.body}
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
