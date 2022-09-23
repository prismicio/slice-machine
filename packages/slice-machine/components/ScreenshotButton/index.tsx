import React from "react";
import { Spinner, Button } from "theme-ui";

import { AiFillCamera } from "react-icons/ai";

const ScreenshotButton: React.FC<{
  onClick: React.MouseEventHandler;
  isLoading: boolean;
  isDisabled: boolean;
}> = ({ isLoading, isDisabled, onClick }) => (
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
    variant={isDisabled ? "buttons.disabled" : "buttons.primary"}
    disabled={isDisabled}
    onClick={onClick}
    data-cy="builder-save-button"
  >
    <>
      {isLoading ? (
        <Spinner
          data-cy="builder-save-button-spinner"
          color="#F7F7F7"
          size={20}
          mr={2}
        />
      ) : (
        <AiFillCamera
          data-cy="builder-save-button-icon"
          style={{ marginRight: "8px", fontSize: "18px" }}
        />
      )}
      <>Take a screenshot</>
    </>
  </Button>
);

export default ScreenshotButton;
