import React from "react";
import { Spinner, Button } from "theme-ui";

const SaveButton: React.FC<{
  onClick: React.MouseEventHandler;
  loading: boolean;
  disabled: boolean;
  children: React.ReactNode;
}> = ({ loading, children, disabled, onClick }) => (
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
    variant={disabled ? "buttons.disabled" : "buttons.primary"}
    disabled={disabled || loading}
    onClick={onClick}
  >
    {loading && (
      <>
        <Spinner color="#F7F7F7" size={24} mr={2} />{" "}
      </>
    )}
    {children}
  </Button>
);

export default SaveButton;
