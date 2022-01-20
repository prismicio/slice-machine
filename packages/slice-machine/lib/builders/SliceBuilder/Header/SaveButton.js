import { Flex, Button, Spinner } from "theme-ui";

const SaveButton = ({ __status, isTouched, onSave, onPush, isLoading }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const onClick = isTouched ? onSave : onPush;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  const unsynced = ["MODIFIED", "NEW_SLICE"].indexOf(__status) !== -1;

  const text = (() => {
    if (isTouched) {
      return "Save model to filesystem";
    }
    if (unsynced) {
      return "Push Slice to Prismic";
    }
    return "Your Slice is up to date!";
  })();

  return (
    <Flex
      as={Button}
      sx={{
        cursor: "pointer",
        p: 2,
        px: 3,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "transparent",
      }}
      variant={isTouched || unsynced ? "buttons.primary" : "buttons.disabled"}
      disabled={!isTouched && !unsynced}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      onClick={onClick}
    >
      {isLoading ? <Spinner color="#F7F7F7" size={24} mr={2} /> : null} {text}
    </Flex>
  );
};

export default SaveButton;
