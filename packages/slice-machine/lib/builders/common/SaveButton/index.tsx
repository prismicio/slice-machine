import React from "react";
import { Spinner, Button } from "theme-ui";

const SaveButton: React.FC<{
  onClick: React.MouseEventHandler;
  isSaving: boolean;
  hasPendingModifications: boolean;
}> = ({ isSaving, hasPendingModifications, onClick }) => (
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
    variant={hasPendingModifications ? "buttons.primary" : "buttons.disabled"}
    disabled={!hasPendingModifications || isSaving}
    onClick={onClick}
    data-cy="builder-save-button"
  >
    <>
      {isSaving ? (
        <Spinner
          color="#F7F7F7"
          size={20}
          mr={2}
          sx={{ position: "relative", top: "5px", left: "3px" }}
        />
      ) : null}
      <>
        {hasPendingModifications
          ? "Save to File System"
          : "Synced with File System"}
      </>
    </>
  </Button>
);

export default SaveButton;
