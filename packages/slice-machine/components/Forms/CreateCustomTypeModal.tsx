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
  dataCy: string;
};

const CreateCustomTypeModal: React.FunctionComponent<CreateCustomTypeModalProps> =
  ({ isOpen, onSubmit, close, customTypes, dataCy }) => {
    return (
      <ModalFormCard
        dataCy={dataCy}
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
        validate={({ id }: { id: string }) => {
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
        {({ errors }: { errors: { id?: string } }) => (
          <Box>
            <SelectRepeatable />
            <InputBox
              name="label"
              label="Custom Type Name"
              placeholder="My Custom Type"
            />
            <InputBox
              name="id"
              label="Custom Type ID"
              placeholder="my-custom-type"
              error={errors.id}
            />
          </Box>
        )}
      </ModalFormCard>
    );
  };

export default CreateCustomTypeModal;
