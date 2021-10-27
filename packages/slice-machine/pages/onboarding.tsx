import {
  Fragment,
  ReactElement,
  useEffect,
  useState,
  //  createRef
} from "react";
import {
  Grid,
  Box,
  Button,
  Flex,
  Spinner,
  Paragraph,
  Heading,
  Image,
} from "theme-ui";
import { LocalStorageKeys } from "@lib/consts";
import router from "next/router";

const Video = (props: React.VideoHTMLAttributes<HTMLVideoElement>) => {
  return (
    <video
      controls
      autoPlay
      loop
      {...props}
      style={{
        maxWidth: "100%",
        height: "auto",
        ...props.style,
      }}
    />
  );
};

// const Header = (props: TextProps) => <Text {...props} sx={{
//   'font-family': "SF Pro Display",
//   'font-style': 'normal',
//   'font-weight': 'bold',
//   'font-size': '20px',
//   'line-height': '32px',
//   'text-align': 'center',
//   ...props.sx
// }} />

// const Par = (props: TextProps) => <Text {...props} sx={{
//   "font-family": "SF Pro Display",
//   "font-style": "normal",
//   "font-weight": "normal",
//   "font-size": "16px",
//   "line-height": "24px",
//   "text-align": "center",
//   ...props.sx
// }} />

const WelcomeSlide = ({ onClick }: { onClick: () => void }) => (
  <>
    <Image sx={{ display: "block" }} src="/SM-LOGO.svg" />
    <Heading
      sx={{
        fontSize: "20px",
        textAlign: "center",
      }}
    >
      Welcome to Slice Machine℠
    </Heading>
    <Paragraph
      sx={{
        fontSize: "16px",
        textAlign: "center",
        paddingBottom: "24px",
      }}
    >
      Prismic’s local component development tool
    </Paragraph>
    <Button onClick={onClick}>Get Started</Button>
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

export default function Onboarding() {
  const [state, setState] = useState({ step: 0 });

  const STEPS = [
    <WelcomeSlide
      onClick={() => setState({ ...state, step: state.step + 1 })}
    />,
    <Fragment>
      <Video src={require("../public/time-lapse-video-of-night-sky.mp4")} />
    </Fragment>,
    <Fragment>
      <Video src={require("../public/pexels-videos-1409899.mp4")} />
    </Fragment>,
    <Fragment>
      <Video src={require("../public/pexels-videos-2231485.mp4")} />
    </Fragment>,
    <Fragment>Bye</Fragment>,
  ];

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
        {!!state.step && (
          <Button variant="transparent" onClick={escape}>
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
          <StepIndicator current={state.step} maxSteps={STEPS.length - 1} />
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
          gridArea: "bottom-right",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {!!state.step && (
          <Button onClick={() => setState({ ...state, step: state.step + 1 })}>
            Continue
          </Button>
        )}
      </Flex>
    </OnboardingGrid>
  );
}
