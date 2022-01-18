import { useRouter } from "next/router";
import React from "react";
import { Button, Flex } from "theme-ui";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

export const SetupError: React.FC = () => {
  const router = useRouter();
  const { openSetupDrawer } = useSliceMachineActions();

  return (
    <Flex
      sx={{
        flexDirection: "column",
        width: "430px",
        alignItems: "center",
        textAlign: "center",
        margin: "80px auto",
      }}
    >
      <h3>Couldn't load Slice Simulator</h3>
      <span>
        We couldn't not find a Slice Simulator URL in your sm.json. Please
        set-up your Slice Simulator first.
      </span>
      <Button
        sx={{
          marginTop: "40px",
        }}
        ml={2}
        type="button"
        variant="primary"
        onClick={() => {
          openSetupDrawer();
          void router.push({
            pathname: "/[lib]/[sliceName]/[variation]",
            query: router.query,
          });
        }}
      >
        Set up Slice Simulator
      </Button>
    </Flex>
  );
};
