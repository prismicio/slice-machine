import { ReactElement, useEffect, useState } from "react";
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
import router from "next/router";

import { BiChevronLeft } from "react-icons/bi";

import BuildSliceVideo from "../public/onboarding-videos/build-slice.mp4";
import AddPageVideo from "../public/onboarding-videos/add-to-page.mp4";
import PushToPrismicVideo from "../public/onboarding-videos/push-to-prismic.mp4";

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

const BuildSlicesSlide = () => (
  <>
    <Image src="/horizontal_split.svg" />
    <Header>Build Slices ℠</Header>
    <SubHeader>The building blocks used to create your website</SubHeader>
    <Video src={BuildSliceVideo} />
  </>
);

const CreatePageTypesSlide = () => (
  <>
    <Image src="/insert_page_break.svg" />
    <Header>Create Page Types</Header>
    <SubHeader>Group your Slices as page builders</SubHeader>
    <Video src={AddPageVideo} />
  </>
);

const PushPagesSlide = () => (
  <>
    <Image src="/send.svg" />
    <Header>Push your pages to Prismic</Header>
    <SubHeader>
      Give your content writers the freedom to build whatever they need
    </SubHeader>
    <Video src={PushToPrismicVideo} />
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

export default function Onboarding(): React.FunctionComponent {
  const STEPS = [
    <WelcomeSlide onClick={nextSlide} />,
    <BuildSlicesSlide />,
    <CreatePageTypesSlide />,
    <PushPagesSlide />,
  ];

  const [state, setState] = useState({ step: 0 });

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.isOnboarded, "true");
  }, []);

  const escape = () => router.push("/");

  function nextSlide() {
    if (state.step === STEPS.length - 1) return escape();
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
          justifyContent: "space-around",
        }}
      >
        {!!state.step && (
          <Button
            variant="transparent"
            onClick={escape}
            data-cy="skip-onboarding"
            title="skip onboarding"
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
          <Button data-cy="continue" onClick={nextSlide} title="continue">
            Continue
          </Button>
        )}
      </Flex>
    </OnboardingGrid>
  );
}
