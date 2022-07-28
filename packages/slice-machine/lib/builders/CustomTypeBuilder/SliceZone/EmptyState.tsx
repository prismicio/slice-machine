import { Text, Flex, Button } from "theme-ui";

const EmptyState: React.FC<{
  onAddNewSlice: () => void;
}> = ({ onAddNewSlice }) => {
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
        <Text sx={{ mb: "24px" }}>Add Slices to your Custom Type</Text>
        <Button
          data-testid="empty-zone-add-a-new-slice"
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
