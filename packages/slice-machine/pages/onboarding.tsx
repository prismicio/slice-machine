import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HeadingProps,
  IconButton,
  Image,
  Paragraph,
  ParagraphProps,
} from "theme-ui";
import router from "next/router";
import { Video as CldVideo } from "cloudinary-react";

import { BiChevronLeft } from "react-icons/bi";
import useSliceMachineActions from "src/modules/useSliceMachineActions";
import Tracker, { ContinueOnboardingType } from "@src/tracker";

const imageSx = { width: "64px", height: "64px", marginBottom: "16px" };

const Video = (props: VideoProps) => (
  <CldVideo
    cloudName="dmtf1daqp"
    autoPlay
    controls
    loop
    style={{
      maxWidth: "100%",
      height: "auto",
    }}
    {...props}
  />
);

const Header = (props: HeadingProps) => (
  <Heading
    {...props}
    sx={{
      textAlign: "center",
      ...props.sx,
    }}
    style={{
      fontSize: "20px",
      lineHeight: "1.5",
      fontWeight: 700,
    }}
  />
);

const SubHeader = (props: ParagraphProps) => (
  <Paragraph
    {...props}
    style={{
      fontSize: "16px",
      textAlign: "center",
      paddingBottom: "24px",
    }}
  />
);

type WithOnEnded = { onEnded: () => void };

const WelcomeSlide = ({ onClick }: { onClick: () => void }) => (
  <>
    <Image sx={{ display: "block", ...imageSx }} src="/SM-LOGO.svg" />
    <Header>Welcome to Slice Machine</Header>
    <SubHeader>Prismic’s local component development tool</SubHeader>
    <Button data-cy="get-started" onClick={onClick} title="start onboarding">
      Get Started
    </Button>
  </>
);
const BuildSlicesSlide = ({ onEnded }: WithOnEnded) => (
  <>
    <Image sx={imageSx} src="/horizontal_split.svg" />
    <Header>Build Slices</Header>
    <SubHeader>The building blocks used to create your website</SubHeader>
    <Video onEnded={onEnded} publicId="SMONBOARDING/BUILD_SLICE" />
  </>
);

const CreatePageTypesSlide = ({ onEnded }: WithOnEnded) => (
  <>
    <Image sx={imageSx} src="/insert_page_break.svg" />
    <Header>Create Page Types</Header>
    <SubHeader>Group your Slices as page builders</SubHeader>
    <Video onEnded={onEnded} publicId="SMONBOARDING/ADD_TO_PAGE" />
  </>
);

const PushPagesSlide = ({ onEnded }: WithOnEnded) => (
  <>
    <Image sx={imageSx} src="/send.svg" />
    <Header>Push your pages to Prismic</Header>
    <SubHeader>
      Give your content writers the freedom to build whatever they need
    </SubHeader>
    <Video onEnded={onEnded} publicId="SMONBOARDING/PUSH_TO_PRISMIC" />
  </>
);

const OnboardingGrid: React.FunctionComponent = ({ children }) => {
  return (
    <Grid
      sx={{
        width: "100vw",
        height: "100vh",
        gridGap: "1rem",
        gridTemplateAreas: `
          "top-left header top-right"
          "... content ..."
          "footer-left footer footer-right"
        `,
        gridTemplateRows: "84px 5fr 1fr",
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
              borderRadius: "10px",
              height: "2px",
            }}
          />
        ))}
      </Grid>
    </Box>
  );
};

function idFromStep(step: number): ContinueOnboardingType {
  switch (step) {
    case 0:
      return ContinueOnboardingType.OnboardingContinueIntro;
    case 1:
      return ContinueOnboardingType.OnboardingContinueScreen1;
    case 2:
      return ContinueOnboardingType.OnboardingContinueScreen2;
    default:
      return ContinueOnboardingType.OnboardingContinueScreen3;
  }
}

function handleTracking(props: {
  step: number;
  maxSteps: number;
  videoCompleted: boolean;
}): void {
  const state = useRef(props);

  useEffect(() => {
    // on update
    state.current = props;
  }, [props]);

  useEffect(() => {
    // on mount
    Tracker.trackOnboardingStart();

    // on unmount
    return () => {
      const { maxSteps, step, videoCompleted } = state.current;

      const hasTheUserSkippedTheOnboarding = step < maxSteps - 1;
      if (hasTheUserSkippedTheOnboarding) {
        Tracker.trackOnboardingSkip(
          step,
          step > 0 ? videoCompleted : undefined
        );
        return;
      }

      Tracker.trackOnboardingContinue(
        ContinueOnboardingType.OnboardingContinueScreen3,
        videoCompleted
      );
    };
  }, []);
}

export default function Onboarding(): JSX.Element {
  const STEPS = [
    <WelcomeSlide onClick={nextSlide} />,
    <BuildSlicesSlide onEnded={handleOnVideoEnd} />,
    <CreatePageTypesSlide onEnded={handleOnVideoEnd} />,
    <PushPagesSlide onEnded={handleOnVideoEnd} />,
  ];

  const { finishOnboarding } = useSliceMachineActions();

  const [state, setState] = useState({
    step: 0,
    videoCompleted: false,
  });

  function handleOnVideoEnd() {
    return setState({ ...state, videoCompleted: true });
  }

  handleTracking({
    ...state,
    maxSteps: STEPS.length,
    videoCompleted: state.videoCompleted,
  });

  const finish = () => {
    finishOnboarding();
    router.push("/");
  };

  function nextSlide() {
    if (state.step === STEPS.length - 1) return finish();
    Tracker.trackOnboardingContinue(
      idFromStep(state.step),
      state.step > 0 ? state.videoCompleted : undefined
    );

    return setState({ ...state, step: state.step + 1, videoCompleted: false });
  }

  function prevSlide() {
    return setState({ ...state, step: state.step - 1, videoCompleted: false });
  }

  return (
    <OnboardingGrid>
      <Flex
        sx={{
          gridArea: "top-right",
          alignItems: "center",
          justifyContent: "end",
          padding: "1em 4em",
        }}
      >
        {!!state.step && (
          <Button
            variant="transparent"
            onClick={finish}
            data-cy="skip-onboarding"
            title="skip onboarding"
            tabIndex={0}
            sx={{
              color: "textClear",
            }}
          >
            skip
          </Button>
        )}
      </Flex>

      {STEPS.map((Component, i) => (
        <Flex
          hidden={i !== state.step}
          key={`step-${i + 1}`}
          sx={{
            gridArea: "content",
            alignItems: "center",
            justifyContent: "center",
            alignContent: "center",
            flexDirection: "column",
            opacity: i === state.step ? "1" : "0",
            pointerEvents: i === state.step ? "all" : "none",
            transition: `opacity .2s ease-in`,
          }}
        >
          {Component}
        </Flex>
      ))}

      <Flex
        sx={{
          gridArea: "footer",
          alignItems: "start",
          justifyContent: "center",
          padingTop: "16px", // half height of a button
        }}
      >
        {!!state.step && (
          <StepIndicator current={state.step - 1} maxSteps={STEPS.length - 1} />
        )}
      </Flex>

      <Flex
        sx={{
          gridArea: "footer-left",
          alignItems: "start",
          justifyContent: "space-around",
        }}
      >
        {state.step >= 2 && (
          <IconButton
            tabIndex={0}
            title="previous slide"
            sx={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#F1F1F4",
              border: "1px solid rgba(62, 62, 72, 0.15)",
            }}
            onClick={prevSlide}
          >
            <BiChevronLeft />
          </IconButton>
        )}
      </Flex>

      <Flex
        sx={{
          gridArea: "footer-right",
          alignItems: "start",
          justifyContent: "end",
          padding: "0em 4em",
        }}
      >
        {!!state.step && (
          <Button
            data-cy="continue"
            onClick={nextSlide}
            title="continue"
            tabIndex={0}
          >
            Continue
          </Button>
        )}
      </Flex>
    </OnboardingGrid>
  );
}
