import { Badge, Text, Card as Themecard, Box, Heading, Flex } from "theme-ui";
import { forwardRef, Fragment } from "react";

import ReactTooltip from "react-tooltip";

const textVariation = (variations) =>
  `${variations.length} variation${variations.length > 1 ? "s" : ""}`;

const States = {
  NEW_SLICE: "New",
  MODIFIED: "Modified",
  SYNCED: "Synced",
  PREVIEW_MISSING: "Preview missing",
  INVALID: "Contains errors",
};

const StateBadge = ({ __status }) => {
  const state = States[__status];
  return (
    <Badge mr="2" variant={__status}>
      {state}
    </Badge>
  );
};

const SliceVariations = ({ hideVariations, jsonModel }) => {
  return !hideVariations ? (
    <>
      {jsonModel.variations ? (
        <Text sx={{ fontSize: 0, color: "textClear" }}>
          {textVariation(jsonModel.variations)}
        </Text>
      ) : null}
    </>
  ) : null;
};

const SliceName = ({ sliceName }) => {
  return (
    <Heading sx={{ flex: 1 }} as="h6">
      {sliceName}
    </Heading>
  );
};

const SliceThumbnail = ({ heightInPx, preview, withShadow = true }) => {
  return (
    <Box
      sx={{
        backgroundColor: "headSection",
        backgroundRepeat: "repeat",
        backgroundSize: "15px",
        backgroundImage: "url(/pattern.png)",
        height: heightInPx,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        border: ({ colors }) => `1px solid ${colors.borders}`,
        boxShadow: withShadow ? "0px 8px 14px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundSize: "contain",
          backgroundPosition: "50%",
          backgroundRepeat: "no-repeat",
          backgroundImage: "url(" + `${preview?.url}` + ")",
        }}
      ></Box>
    </Box>
  );
};

const SliceState = ({ status, renderSliceState, slice }) => {
  return renderSliceState ? (
    <>{renderSliceState(slice, <StateBadge __status={status} />)}</>
  ) : (
    <StateBadge __status={status} />
  );
};

const ForSlicePage = forwardRef(
  (
    {
      slice,
      renderSliceState,
      hideVariations,
      heightInPx = "287px",
      defaultVariation,
      sx = {},
    },
    ref
  ) => {
    const preview = slice?.infos.previewUrls[defaultVariation.id];
    return (
      <Themecard
        tabindex="0"
        role="button"
        aria-pressed="false"
        ref={ref}
        sx={{
          bg: "transparent",
          border: "none",
          transition: "all 100ms cubic-bezier(0.215,0.60,0.355,1)",
          ...sx,
        }}
      >
        <SliceThumbnail preview={preview} heightInPx={heightInPx} />
        <Flex
          mt={3}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <SliceState
            slice={slice}
            renderSliceState={renderSliceState}
            status={slice.__status}
          />
          <SliceName sliceName={slice?.infos?.sliceName} />
          <SliceVariations
            jsonModel={slice?.jsonModel}
            hideVariations={hideVariations}
          />
        </Flex>
      </Themecard>
    );
  }
);

const ForSliceZone = forwardRef(
  (
    {
      slice,
      renderSliceState,
      hideVariations,
      heightInPx = "260px",
      defaultVariation,
      sx = {},
    },
    ref
  ) => {
    const preview = slice?.infos.previewUrls[defaultVariation.id];
    return (
      <Themecard
        p={3}
        tabindex="0"
        role="button"
        aria-pressed="false"
        ref={ref}
        sx={{
          border: (t) => `1px solid ${t.colors.code.border}`,
          bg: "transparent",
          transition: "all 200ms ease-in",
          ...sx,
          "&:hover": {
            transition: "all 200ms ease-out",
            bg: "sidebar",
            border: (t) => `1px solid ${t.colors.sidebar}`,
          },
        }}
      >
        <SliceThumbnail
          withShadow={false}
          preview={preview}
          heightInPx={heightInPx}
        />
        <Flex
          mt={3}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <SliceName sliceName={slice?.infos?.sliceName} />
          <SliceVariations
            jsonModel={slice?.jsonModel}
            hideVariations={hideVariations}
          />
        </Flex>
      </Themecard>
    );
  }
);

const Card = ({ cardType, ...otherProps }) => {
  switch (cardType) {
    case "ForSlicePage":
      return <ForSlicePage {...otherProps} />;
    case "ForSliceZone":
      return <ForSliceZone {...otherProps} />;
  }
};

export default Card;
