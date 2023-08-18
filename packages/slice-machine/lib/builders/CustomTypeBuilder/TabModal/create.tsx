import ModalFormCard from "../../../../components/ModalFormCard";
import { InputBox } from "./InputBox";

const formId = "create-tab";

const CreateCustomTypeForm = ({
  isOpen,
  onSubmit,
  close,
  tabIds,
}: {
  isOpen: boolean;
  onSubmit: (values: { id: string }) => void;
  close: () => void;
  tabIds: ReadonlyArray<string>;
}) => {
  return (
    <ModalFormCard
      isOpen={isOpen}
      widthInPx="530px"
      formId={formId}
      close={close}
      onSubmit={(values) => {
        onSubmit(values);
        close();
      }}
      initialValues={{
        id: "",
      }}
      validate={({ id }) => {
        if (!id) {
          return {
            id: "Tab ID is required",
          };
        }
        if (tabIds.includes(id.toLowerCase())) {
          return {
            id: "Tab exists already",
          };
        }
      }}
      content={{
        title: "Add Tab",
      }}
    >
      {({ errors }) => (
        <InputBox
          name="id"
          label="New Tab ID"
          placeholder="A label for selecting the tab (i.e. not used in the API)"
          error={errors.id}
        />
      )}
    </ModalFormCard>
  );
};

export default CreateCustomTypeForm;
