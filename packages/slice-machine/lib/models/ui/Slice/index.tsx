import { Fragment } from "react";
import {
  Theme,
  Text,
  Card as Themecard,
  Box,
  Heading,
  Flex,
  Badge,
} from "theme-ui";

import SliceState from "../SliceState";
import { LibStatus } from "../../common/ComponentUI";

import { Link as LinkUtil } from "../Link";
import { WrapperType, WrapperByType } from "./wrappers";

const StateBadgeText = {
  [LibStatus.Modified]: "Modified",
  [LibStatus.Synced]: "Synced",
  [LibStatus.PreviewMissing]: "Preview missing",
  [LibStatus.Invalid]: "Contains errors",
  [LibStatus.NewSlice]: "New",
};

const StatusBadge = ({ libStatus }: { libStatus: LibStatus }) => {
  const status = StateBadgeText[libStatus];

  return (
    <Badge mr="2" variant={libStatus}>
      {status}
    </Badge>
  );
};

const borderedSx = (sx: any) => ({
  border: (t: Theme) => `1px solid ${t.colors?.border}`,
  bg: "transparent",
  transition: "all 200ms ease-in",
  p: 3,
  ...sx,
  "&:hover": {
    transition: "all 200ms ease-out",
    bg: "sidebar",
    border: (t: Theme) => `1px solid ${t.colors?.sidebar}`,
  },
});

const defaultSx = (sx: any) => ({
  bg: "transparent",
  border: "none",
  transition: "all 100ms cubic-bezier(0.215,0.60,0.355,1)",
  ...sx,
});

const SliceVariations = ({
  hideVariations,
  variations,
}: {
  hideVariations: boolean;
  variations: ReadonlyArray<any>;
}) => {
  return !hideVariations ? (
    <>
      {variations ? (
        <Text sx={{ fontSize: 0, color: "textClear" }}>
          {variations.length} variation{variations.length > 1 ? "s" : ""}
        </Text>
      ) : null}
    </>
  ) : null;
};

const SliceThumbnail = ({
  heightInPx,
  screenshotUrl,
  withShadow = true,
}: {
  heightInPx: string;
  screenshotUrl?: string;
  withShadow: boolean;
}) => {
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
        border: (t) => `1px solid ${t.colors?.borders}`,
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
          backgroundImage: screenshotUrl
            ? "url(" + `${screenshotUrl}` + ")"
            : "none",
        }}
      ></Box>
    </Box>
  );
};

export const SharedSlice = {
  render({
    bordered,
    slice,
    displayStatus,
    Wrapper,
    CustomStatus,

    thumbnailHeightPx = "280px",
    wrapperType = WrapperType.clickable,
    sx,
  }: {
    bordered?: boolean;
    displayStatus?: boolean;

    CustomStatus?: any;
    Wrapper?: any /* ? */;
    slice: SliceState;
    wrapperType?: WrapperType;
    thumbnailHeightPx?: string;
    sx?: any;
  }) {
    const defaultVariation = SliceState.variation(slice);
    if (!defaultVariation) {
      return null;
    }
    const variationId = defaultVariation.id;
    const link = LinkUtil.variation(slice.href, slice.model.name, variationId);

    const CardWrapper = Wrapper || WrapperByType[wrapperType];

    const screenshotUrl = slice?.screenshotUrls?.[variationId]?.url;

    console.log({ slice, preview: slice?.screenshotUrls?.[variationId] });

    return (
      <CardWrapper link={link} slice={slice}>
        <Themecard
          role="button"
          aria-pressed="false"
          sx={bordered ? borderedSx(sx) : defaultSx(sx)}
        >
          <SliceThumbnail
            withShadow={false}
            screenshotUrl={screenshotUrl}
            heightInPx={thumbnailHeightPx}
          />
          <Flex
            mt={3}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Flex sx={{ alignItems: "center" }}>
              {CustomStatus ? (
                <CustomStatus slice={slice} />
              ) : (
                <Fragment>
                  {displayStatus && slice.__status ? (
                    <StatusBadge libStatus={slice.__status} />
                  ) : null}
                </Fragment>
              )}
              <Heading sx={{ flex: 1 }} as="h6">
                {slice.infos.sliceName}
              </Heading>
            </Flex>
            <SliceVariations
              variations={slice.variations}
              hideVariations={false}
            />
          </Flex>
        </Themecard>
      </CardWrapper>
    );
  },
};

export const NonSharedSlice = {
  render({
    bordered,
    slice,
    displayStatus,
    thumbnailHeightPx = "280px",
    wrapperType = WrapperType.nonClickable,
    sx,
  }: {
    bordered: boolean;
    slice: { key: string; value: any };
    displayStatus?: boolean;
    thumbnailHeightPx?: string;
    wrapperType?: WrapperType;
    sx?: any;
  }) {
    const Wrapper = WrapperByType[wrapperType];

    return (
      <Wrapper link={undefined}>
        <Themecard sx={bordered ? borderedSx(sx) : defaultSx(sx)}>
          <SliceThumbnail withShadow={false} heightInPx={thumbnailHeightPx} />
          <Flex
            mt={3}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Flex>
              {displayStatus ? (
                <Badge mr={2} variant="modified">
                  Non shared
                </Badge>
              ) : null}
              <Heading sx={{ flex: 1 }} as="h6">
                {slice?.value?.fieldset || slice.key}
              </Heading>
            </Flex>
          </Flex>
        </Themecard>
      </Wrapper>
    );
  },
};
