import { Text, Flex, Button } from "theme-ui";

import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

const EmptyState: React.FC<{
  format: CustomTypeFormat;
  onAddNewSlice: () => void;
}> = ({ format, onAddNewSlice }) => {
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  return (
    <Flex
      sx={{
        justifyContent: "center",
        mt: "40px",
        alignItems: "center",
        pb: "40px",
      }}
    >
      <Flex
        sx={{
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Text variant={"small"} sx={{ mb: 2 }}>
          Add your Slices
        </Text>
        <Text sx={{ mb: "24px" }}>
          Add Slices to your{" "}
          {customTypesMessages.name({ start: false, plural: false })}
        </Text>
        <Button
          data-cy="update-slices"
          variant="buttons.darkSmall"
          onClick={onAddNewSlice}
        >
          Add a new Slice
        </Button>
      </Flex>
    </Flex>
  );
};

export default EmptyState;
