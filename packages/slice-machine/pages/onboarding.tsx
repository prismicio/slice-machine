import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
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
  useThemeUI,
} from "theme-ui";
import { useRouter } from "next/router";
import { BiChevronLeft } from "react-icons/bi";
import useSliceMachineActions from "../src/modules/useSliceMachineActions";
import { telemetry } from "@src/apiClient";
import SliceMachineLogo from "../components/AppLayout/Navigation/Icons/SliceMachineLogo";
import { getFramework } from "../src/modules/environment";
import {
  VIDEO_ONBOARDING_BUILD_A_SLICE,
  VIDEO_ONBOARDING_ADD_TO_PAGE,
  VIDEO_ONBOARDING_PUSH_CHANGES,
} from "../lib/consts";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";

import Video from "@components/CloudVideo";

const imageSx = { width: "64px", height: "64px", marginBottom: "16px" };

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

const WelcomeSlide = ({ onClick }: { onClick: () => void }) => {
  const { theme } = useThemeUI();

  return (
    <>
      <Flex sx={{ ...imageSx }}>
        <SliceMachineLogo
          width={imageSx.width}
          height={imageSx.height}
          fill={theme.colors?.purple as string}
        />
      </Flex>
      <Header>Welcome to Slice Machine</Header>
      <SubHeader>Prismic’s local component development tool</SubHeader>
      <Button data-cy="get-started" onClick={onClick} title="start onboarding">
        Get Started
      </Button>
    </>
  );
};

type SlideWithPlay = FC<{ onPlay: () => void }>;
const BuildSlicesSlide: SlideWithPlay = ({ onPlay }) => (
  <>
    <Image sx={imageSx} src="/horizontal_split.svg" />
    <Header>Build Slices</Header>
    <SubHeader>The building blocks used to create your website</SubHeader>
    <Video onPlay={onPlay} publicId={VIDEO_ONBOARDING_BUILD_A_SLICE} />
  </>
);

const CreatePageTypesSlide: SlideWithPlay = ({ onPlay }) => (
  <>
    <Image sx={imageSx} src="/insert_page_break.svg" />
    <Header>Create Page Types</Header>
    <SubHeader>Group your Slices as page builders</SubHeader>
    <Video onPlay={onPlay} publicId={VIDEO_ONBOARDING_ADD_TO_PAGE} />
  </>
);

const PushPagesSlide: SlideWithPlay = ({ onPlay }) => (
  <>
    <Image sx={imageSx} src="/send.svg" />
    <Header>Push your pages to Prismic</Header>
    <SubHeader>
      Give your content writers the freedom to build whatever they need
    </SubHeader>
    <Video onPlay={onPlay} publicId={VIDEO_ONBOARDING_PUSH_CHANGES} />
  </>
);

type OnboardingGridProps = Readonly<{
  children?: ReactNode;
}>;

const OnboardingGrid: FC<OnboardingGridProps> = ({ children }) => {
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

function trackStep(step: number): ReturnType<typeof telemetry.track> {
  switch (step) {
    case 0:
      return telemetry.track({ event: "onboarding:continue:screen-intro" });
    case 1:
      return telemetry.track({ event: "onboarding:continue:screen-1" });
    case 2:
      return telemetry.track({ event: "onboarding:continue:screen-2" });
    case 3:
      return telemetry.track({ event: "onboarding:continue:screen-3" });
    default:
      throw new Error(`Invalid step '${step}'.`);
  }
}

function useTracking(props: { step: number; maxSteps: number }): void {
  const state = useRef(props);

  useEffect(() => {
    // on update
    state.current = props;
  }, [props]);

  useEffect(() => {
    // on mount
    void telemetry.track({ event: "onboarding:start" });

    // on unmount
    return () => {
      const { maxSteps, step } = state.current;

      const hasTheUserSkippedTheOnboarding = step < maxSteps - 1;
      if (hasTheUserSkippedTheOnboarding) {
        void telemetry.track({ event: "onboarding:skip", screenSkipped: step });
        return;
      }

      void trackStep(3);
    };
  }, []);
}

export default function Onboarding(): JSX.Element {
  const router = useRouter();

  const { framework } = useSelector((store: SliceMachineStoreType) => ({
    framework: getFramework(store),
  }));

  const createOnPlay = (id: string) => () => {
    void telemetry.track({
      event: "open-video-tutorials",
      framework,
      video: id,
    });
  };

  const STEPS = [
    <WelcomeSlide onClick={nextSlide} />,
    <BuildSlicesSlide onPlay={createOnPlay(VIDEO_ONBOARDING_BUILD_A_SLICE)} />,
    <CreatePageTypesSlide
      onPlay={createOnPlay(VIDEO_ONBOARDING_ADD_TO_PAGE)}
    />,
    <PushPagesSlide onPlay={createOnPlay(VIDEO_ONBOARDING_PUSH_CHANGES)} />,
  ];

  const { finishOnboarding } = useSliceMachineActions();

  const [state, setState] = useState({
    step: 0,
  });

  useTracking({
    ...state,
    maxSteps: STEPS.length,
  });

  const finish = () => {
    finishOnboarding();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/");
  };

  function nextSlide() {
    if (state.step === STEPS.length - 1) return finish();
    void trackStep(state.step);

    return setState({ ...state, step: state.step + 1 });
  }

  function prevSlide() {
    return setState({ ...state, step: state.step - 1 });
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
          key={`step-${i + 1}`}
          sx={{
            display: i === state.step ? "flex" : "none",
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
