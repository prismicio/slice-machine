import { Box } from "theme-ui";

import { CustomType, ObjectTabs } from "@lib/models/common/CustomType";

import ModalFormCard from "@components/ModalFormCard";
import { CtPayload } from "pages";
import { InputBox } from "./components/InputBox";
import { SelectRepeatable } from "./components/SelectRepeatable";

type CreateCustomTypeModalProps = {
  isOpen: boolean;
  onSubmit: (values: CtPayload) => void;
  close: () => void;
  customTypes: Partial<ReadonlyArray<CustomType<ObjectTabs>>>;
};

const CreateCustomTypeModal: React.FunctionComponent<CreateCustomTypeModalProps> =
  ({ isOpen, onSubmit, close, customTypes }) => (
    <ModalFormCard
      dataCy="create-ct-modal"
      isOpen={isOpen}
      widthInPx="530px"
      formId="create-custom-type"
      close={() => close()}
      onSubmit={(values: CtPayload) => {
        onSubmit({ ...values, label: values.label || values.id });
      }}
      initialValues={{
        repeatable: true,
      }}
      validate={({ id, label }: { id: string; label: string }) => {
        if (!label || !label.length) {
          return { label: "Cannot be empty" };
        }
        if (!id || !id.length) {
          return { id: "ID cannot be empty" };
        }
        if (id && !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.exec(id)) {
          return { id: "Invalid id: No special characters allowed" };
        }
        if (id && customTypes.map((e) => e?.id.toLowerCase()).includes(id)) {
          return { id: `ID "${id}" exists already` };
        }
      }}
      content={{
        title: "Create a new custom type",
      }}
    >
      {({ errors }: { errors: { id?: string; label?: string } }) => (
        <Box>
          <SelectRepeatable />
          <InputBox
            name="label"
            label="Custom Type Name"
            dataCy="ct-name-input"
            placeholder="My Custom Type"
            error={errors.label}
          />
          <InputBox
            name="id"
            dataCy="ct-id-input"
            label="Custom Type ID"
            placeholder="my-custom-type"
            error={errors.id}
          />
        </Box>
      )}
    </ModalFormCard>
  );

export default CreateCustomTypeModal;
