import { Box } from "theme-ui";

import ModalFormCard from "@components/ModalFormCard";
import { InputBox } from "./components/InputBox";
import { SelectRepeatable } from "./components/SelectRepeatable";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectLocalCustomTypes } from "@src/modules/customTypes";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

const CreateCustomTypeModal: React.FunctionComponent = () => {
  const { createCustomType, closeCreateCustomTypeModal } =
    useSliceMachineActions();

  const { customTypes, isCreateCustomTypeModalOpen, isCreatingCustomType } =
    useSelector((store: SliceMachineStoreType) => ({
      customTypes: selectLocalCustomTypes(store),
      isCreateCustomTypeModalOpen: isModalOpen(
        store,
        ModalKeysEnum.CREATE_CUSTOM_TYPE
      ),
      isCreatingCustomType: isLoading(
        store,
        LoadingKeysEnum.CREATE_CUSTOM_TYPE
      ),
    }));

  return (
    <ModalFormCard
      dataCy="create-ct-modal"
      isOpen={isCreateCustomTypeModalOpen}
      widthInPx="530px"
      formId="create-custom-type"
      buttonLabel={"Create"}
      close={closeCreateCustomTypeModal}
      onSubmit={(values) => {
        createCustomType(
          values.id,
          values.label || values.id,
          values.repeatable
        );
      }}
      isLoading={isCreatingCustomType}
      initialValues={{
        repeatable: true,
        id: "",
        label: "",
      }}
      validate={({ id, label }) => {
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
      {({ errors }) => (
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
};

export default CreateCustomTypeModal;
