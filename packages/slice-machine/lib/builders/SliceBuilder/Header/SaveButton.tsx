import React from "react";
import { Spinner, Button } from "theme-ui";

const SaveButton: React.FC<{
  __status: string;
  isTouched: boolean;
  onSave: () => void;
  onPush: () => void;
  isLoading: boolean;
}> = ({ __status, isTouched, onSave, onPush, isLoading }) => {
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
    <Button
      sx={{
        display: "flex",
        cursor: "pointer",
        p: 2,
        px: 3,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "transparent",
      }}
      variant={isTouched || unsynced ? "buttons.primary" : "buttons.disabled"}
      disabled={!isTouched && !unsynced}
      onClick={onClick}
    >
      {isLoading ? <Spinner color="#F7F7F7" size={24} mr={2} /> : null} {text}
    </Button>
  );
};

export default SaveButton;
