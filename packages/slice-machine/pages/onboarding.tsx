import { useEffect, useState, useRef } from "react";
import {
  Grid,
  Box,
  Button,
  Flex,
  Paragraph,
  Heading,
  Image,
  HeadingProps,
  ParagraphProps,
  IconButton,
} from "theme-ui";
import { LocalStorageKeys } from "@lib/consts";
import {
  TrackingEventId,
  OnboardingStartEvent,
  OnboardingSkipEvent,
  OnboardingContinueEvent,
  OnboardingContinueWithVideoEvent,
} from "@lib/models/common/TrackingEvent";
import router from "next/router";

import { BiChevronLeft } from "react-icons/bi";
import { Video as CldVideo } from "cloudinary-react";

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

function idFromStep(
  step: number
):
  | TrackingEventId.ONBOARDING_CONTINUE_SCREEN_INTRO
  | TrackingEventId.ONBOARDING_FIRST
  | TrackingEventId.ONBOARDING_SECOND
  | TrackingEventId.ONBOARDING_THIRD {
  switch (step) {
    case 0:
      return TrackingEventId.ONBOARDING_CONTINUE_SCREEN_INTRO;
    case 1:
      return TrackingEventId.ONBOARDING_FIRST;
    case 2:
      return TrackingEventId.ONBOARDING_SECOND;
    default:
      return TrackingEventId.ONBOARDING_THIRD;
  }
}

function postTracking(
  onboardingEvent:
    | OnboardingStartEvent
    | OnboardingSkipEvent
    | OnboardingContinueEvent
    | OnboardingContinueWithVideoEvent
): Promise<Response> {
  return fetch("/tracking/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(onboardingEvent),
  });
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
    postTracking({ id: TrackingEventId.ONBOARDING_START });

    return () => {
      // on unmount
      const { maxSteps, step, videoCompleted } = state.current;

      const data: OnboardingSkipEvent | OnboardingContinueWithVideoEvent =
        step < maxSteps - 1
          ? {
              id: TrackingEventId.ONBOARDING_SKIP,
              screenSkipped: step,
              ...(step > 0 ? { onboardingVideoCompleted: videoCompleted } : {}),
            }
          : {
              id: TrackingEventId.ONBOARDING_THIRD,
              onboardingVideoCompleted: videoCompleted,
            };

      postTracking(data).catch(console.error);
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

  const [state, setState] = useState({
    step: 0,
    startTime: Date.now(),
    videoCompleted: false,
  });

  function handleOnVideoEnd() {
    return setState({ ...state, videoCompleted: true });
  }

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.isOnboarded, "true");
  }, []);

  handleTracking({
    ...state,
    maxSteps: STEPS.length,
    videoCompleted: state.videoCompleted,
  });

  const escape = () => router.push("/");

  function nextSlide() {
    if (state.step === STEPS.length - 1) return escape();
    const id = idFromStep(state.step);
    const data: OnboardingContinueEvent | OnboardingContinueWithVideoEvent = {
      id,
      ...(state.step > 0
        ? { onboardingVideoCompleted: state.videoCompleted }
        : {}),
    };

    postTracking(data);

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
            onClick={escape}
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
