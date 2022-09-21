import React from "react";
import { Spinner, Button } from "theme-ui";

import { AiFillSave } from "react-icons/ai";

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
          data-cy="builder-save-button-spinner"
          color="#F7F7F7"
          size={20}
          mr={2}
        />
      ) : (
        <AiFillSave
          data-cy="builder-save-button-icon"
          style={{ marginRight: "8px", fontSize: "18px" }}
        />
      )}
      <>Save to File System</>
    </>
  </Button>
);

export default SaveButton;
