import React from "react";
import { ToastProvider } from "react-toast-notifications";
import { Box } from "theme-ui";

const snackStates = {
  entering: { transform: "translate3d(0, 120%, 0) scale(0.9)" },
  entered: { transform: "translate3d(0, 0, 0) scale(1)" },
  exiting: { transform: "translate3d(0, 120%, 0) scale(0.9)" },
  exited: { transform: "translate3d(0, 120%, 0) scale(0.9)" },
};

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider
      autoDismiss
      autoDismissTimeout={6000}
      components={{
        Toast: (props) => {
          return (
            <Box
              sx={{
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                borderRadius: 6,
                boxShadow: `0px 1px 3px 0px rgba(0, 0, 0, 0.2)`,
                fontSize: 1,
                lineHeight: "22px",
                color: "white",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                minWidth: 288,
                maxWidth: 568,
                py: 2,
                px: 3,
                mb: 1,
                pointerEvents: "initial",
                transitionProperty: `transform`,
                transitionDuration: `${props.transitionDuration}ms`,
                transitionTimingFunction: `cubic-bezier(0.2, 0, 0, 1)`,
                transformOrigin: "bottom",
                zIndex: 2,
                ...snackStates[props.transitionState],
              }}
            >
              {props.children}
            </Box>
          );
        },
      }}
      placement="bottom-center"
    >
      {children}
    </ToastProvider>
  );
};

export default Provider;
