import React from "react";
import Drawer from "rc-drawer";
import { Close, Flex, Heading } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import Card from "@components/Card";

export const SliceMachineDrawerUI: React.FunctionComponent<{
  isOpen: boolean;
  title: string;
  footer: React.ReactNode;
  explanations: React.ReactNode;
}> = ({ isOpen, title, footer, explanations }) => {
  const { closeModals } = useSliceMachineActions();

  return (
    <Drawer
      placement="right"
      open={isOpen}
      level={null}
      onClose={closeModals}
      width={496}
    >
      <Card
        radius={"0px"}
        bodySx={{
          bg: "white",
          padding: 24,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "scroll",
        }}
        footerSx={{
          p: 0,
        }}
        sx={{
          flexDirection: "column",
          display: "flex",
          height: "100%",
          border: "none",
        }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Flex sx={{ alignItems: "center" }}>
              <Heading sx={{ fontSize: "14px", fontWeight: "bold", ml: 1 }}>
                {title}
              </Heading>
            </Flex>
            <Close type="button" onClick={() => closeModals()} />
          </Flex>
        )}
        Footer={() => (
          <Flex
            sx={{
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingRight: 16,
              borderTop: (t) => `1px solid ${String(t.colors?.darkBorders)}`,
              backgroundColor: "white",
              padding: 20,
            }}
          >
            {footer}
          </Flex>
        )}
      >
        {explanations}
      </Card>
    </Drawer>
  );
};
