import { Badge, Text, Card as Themecard, Box, Heading, Flex } from "theme-ui";
import { forwardRef, Fragment } from "react";

import ReactTooltip from "react-tooltip";

const textVariation = (variations) =>
  `${variations.length} variation${variations.length > 1 ? "s" : ""}`;

const States = {
  NEW_SLICE: "New",
  MODIFIED: "Local Update",
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

const SliceThumbnail = ({ heightInPx, preview }) => {
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
        boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.1)",
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
        <SliceName sliceName={slice?.infos?.sliceName} />
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

/** 

const Card = forwardRef(
  (
    {
      slice,
      defaultVariation,
      sx = {},
      hideVariations,
      renderSliceState,
      heightInPx = "287px",
      ...props
    },
    ref
  ) => {
    const { infos, jsonModel, __status } = slice;
    const preview = infos.previewUrls[defaultVariation.id];
    return (
      <Themecard
        {...props}
        variant=""
        tabindex="0"
        role="button"
        aria-pressed="false"
        bg="red"
        ref={ref}
        sx={{
          //bg: "transparent",
          border: "none",
          transition: "all 100ms cubic-bezier(0.215,0.60,0.355,1)",
          ...sx,
        }}
      >
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
            boxShadow: "0px 8px 14px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundSize: "contain",
              backgroundPosition: "50%",
              backgroundRepeat: "no-repeat",
              backgroundImage: "url(" + `${preview && preview.url}` + ")",
            }}
          ></Box>
        </Box>

        <Flex>
          <Box py={2} sx={{ flex: "1 1 auto" }}>
            <Heading as="h6" my={2}>
              {infos.sliceName}
            </Heading>
            {!hideVariations ? (
              <Fragment>
                {jsonModel.variations ? (
                  <Text sx={{ fontSize: 1, color: "textClear" }}>
                    {textVariation(jsonModel.variations)}
                  </Text>
                ) : null}
              </Fragment>
            ) : null}
          </Box>

          <Box py={2}>
            {renderSliceState ? (
              <Fragment>
                {renderSliceState(slice, <StateBadge __status={__status} />)}
              </Fragment>
            ) : (
              <StateBadge __status={__status} />
            )}

            
            {infos.nameConflict ? (
              <Fragment>
                <ReactTooltip
                  type="light"
                  multiline
                  border
                  borderColor={"tomato"}
                />
                <Badge
                  ml={2}
                  mt="3px"
                  pt="2px"
                  pb="3px"
                  px="8px"
                  bg="error"
                  variant="outline"
                  sx={{ color: "#FFF" }}
                  data-place="bottom"
                  data-tip={`Slice name "${infos.nameConflict.sliceName}" can't be transformed<br/> to snake case "${nameConflict.id}". Please update one of these values manually!`}
                >
                  Name conflict
                </Badge>
              </Fragment>
            ) : null}
          </Box>
        </Flex>
      </Themecard>
    );
  }
);
*/
export default Card;
