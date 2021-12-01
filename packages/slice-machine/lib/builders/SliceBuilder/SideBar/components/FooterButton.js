import { Button, Flex, Spinner } from "theme-ui";

const FooterButton = ({ __status, isTouched, onSave, onPush, loading }) => {
  const onClick = isTouched ? onSave : onPush;
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
        width: "100%",
        borderTopRightRadius: "0",
        borderTopLeftRadius: "0",
        cursor: "pointer",
        p: 3,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "transparent",
      }}
      variant={isTouched || unsynced ? "buttons.primary" : "buttons.disabled"}
      disabled={!isTouched && !unsynced}
      onClick={onClick}
    >
      {loading ? <Spinner color="#F7F7F7" size={24} mr={2} /> : null} {text}
    </Flex>
  );
};

export default FooterButton;
