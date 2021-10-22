import { Fragment, ReactElement, useEffect, useState } from "react";
import { Grid, Box, Button, Flex, Spinner } from "theme-ui";
import { LocalStorageKeys } from "@lib/consts";
import router from "next/router";

const STEPS = [
  <Fragment>Hi 1!</Fragment>,
  <Fragment>Hi 2!</Fragment>,
  <Fragment>Hi 3!</Fragment>,
  <Fragment>Hi 4!</Fragment>,
];

const OnboardingGrid = ({
  children,
}: {
  children: ReactElement | ReadonlyArray<ReactElement>;
}) => {
  return (
    <Grid
      sx={{
        width: "100vw",
        height: "100vh",
        gridGap: "1rem",
        gridTemplateAreas: `
          "top-left header top-right"
          "... content ..."
          "bottom-left footer bottom-right"
        `,
        gridTemplateRows: "1fr 5fr 1fr",
      }}
      columns="1fr 2fr 1fr"
    >
      {children}
    </Grid>
  );
};

const StepIndicator = ({
  current,
  maxSteps,
}: {
  current: number;
  maxSteps: number;
}) => {
  const columns = Array(maxSteps).fill(1);
  return (
    <Box sx={{ width: "40%" }}>
      <Grid gap={2} columns={maxSteps}>
        {columns.map((_, i) => (
          <Box
            key={`box-${i + 1}`}
            sx={{
              bg: i <= current ? "primary" : "muted",
              height: "4px",
            }}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default function Changelog() {
  const [state, setState] = useState({ step: 0 });

  const escape = () => router.push("/");

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.isOnboarded, "yes");
  }, []);

  useEffect(() => {
    if (state.step === STEPS.length) {
      escape();
    }
  }, [state.step]);

  return (
    <OnboardingGrid>
      <Flex
        sx={{
          gridArea: "top-right",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Button variant="transparent" onClick={escape}>
          skip
        </Button>
      </Flex>
      <Flex
        sx={{
          gridArea: "footer",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <StepIndicator current={state.step} maxSteps={STEPS.length} />
      </Flex>

      <Flex
        sx={{
          gridArea: "content",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {STEPS[state.step] ? STEPS[state.step] : <Spinner />}
      </Flex>

      <Flex
        sx={{
          gridArea: "bottom-right",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Button onClick={() => setState({ ...state, step: state.step + 1 })}>
          Continue
        </Button>
      </Flex>
    </OnboardingGrid>
  );
}
