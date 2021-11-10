import { ReactElement, useEffect, useState, useRef } from "react";
import {
  Grid,
  Box,
  Button,
  Flex,
  Spinner,
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
    sx={{ fontSize: "20px", textAlign: "center", ...props.sx }}
  />
);

const SubHeader = (props: ParagraphProps) => (
  <Paragraph
    {...props}
    sx={{
      fontSize: "16px",
      textAlign: "center",
      paddingBottom: "24px",
      ...props.sx,
    }}
  />
);

type WithOnEnded = { onEnded: () => void };

const WelcomeSlide = ({ onClick }: { onClick: () => void }) => (
  <>
    <Image sx={{ display: "block" }} src="/SM-LOGO.svg" />
    <Header>Welcome to Slice Machine ℠</Header>
    <SubHeader>Prismic’s local component development tool</SubHeader>
    <Button data-cy="get-started" onClick={onClick} title="start onboarding">
      Get Started
    </Button>
  </>
);
const BuildSlicesSlide = ({ onEnded }: WithOnEnded) => (
  <>
    <Image src="/horizontal_split.svg" />
    <Header>Build Slices ℠</Header>
    <SubHeader>The building blocks used to create your website</SubHeader>
    <Video onEnded={onEnded} publicId="SMONBOARDING/BUILD_SLICE" />
  </>
);

const CreatePageTypesSlide = ({ onEnded }: WithOnEnded) => (
  <>
    <Image src="/insert_page_break.svg" />
    <Header>Create Page Types</Header>
    <SubHeader>Group your Slices as page builders</SubHeader>
    <Video onEnded={onEnded} publicId="SMONBOARDING/ADD_TO_PAGE" />
  </>
);

const PushPagesSlide = ({ onEnded }: WithOnEnded) => (
  <>
    <Image src="/send.svg" />
    <Header>Push your pages to Prismic</Header>
    <SubHeader>
      Give your content writers the freedom to build whatever they need
    </SubHeader>
    <Video onEnded={onEnded} publicId="SMONBOARDING/PUSH_TO_PRISMIC" />
  </>
);

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

function onboardingEvent(
  data:
    | OnboardingStartEvent
    | OnboardingSkipEvent
    | OnboardingContinueEvent
    | OnboardingContinueWithVideoEvent
): Promise<Response> {
  return fetch("/tracking/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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
    onboardingEvent({ id: TrackingEventId.ONBOARDING_START, time: Date.now() });

    return () => {
      // on unmount
      const { maxSteps, step, videoCompleted } = state.current;
      const time = Date.now();

      const data: OnboardingSkipEvent | OnboardingContinueWithVideoEvent =
        step < maxSteps - 1
          ? {
              id: TrackingEventId.ONBOARDING_SKIP,
              time,
              screen: step,
              ...(step > 0 ? { completed: videoCompleted } : {}),
            }
          : {
              id: TrackingEventId.ONBOARDING_THIRD,
              time,
              completed: videoCompleted,
            };

      onboardingEvent(data).catch(console.error);
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
    const time = Date.now();
    const data: OnboardingContinueEvent | OnboardingContinueWithVideoEvent = {
      id,
      time,
      ...(state.step > 0 ? { completed: state.videoCompleted } : {}),
    };

    onboardingEvent(data);

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
          justifyContent: "space-around",
        }}
      >
        {!!state.step && (
          <Button
            variant="transparent"
            onClick={escape}
            data-cy="skip-onboarding"
            title="skip onboarding"
            tabIndex={0}
          >
            skip
          </Button>
        )}
      </Flex>
      <Flex
        sx={{
          gridArea: "footer",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {!!state.step && (
          <StepIndicator current={state.step - 1} maxSteps={STEPS.length - 1} />
        )}
      </Flex>

      <Flex
        sx={{
          gridArea: "content",
          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "column",
        }}
      >
        {STEPS[state.step] ? STEPS[state.step] : <Spinner />}
      </Flex>

      <Flex
        sx={{
          gridArea: "bottom-left",
          alignItems: "center",
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
          gridArea: "bottom-right",
          alignItems: "center",
          justifyContent: "space-around",
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
