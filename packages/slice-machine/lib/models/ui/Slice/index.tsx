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
import { ThemeUIStyleObject } from "@theme-ui/css";

import { ComponentUI, LibStatus } from "../../common/ComponentUI";

import { Link as LinkUtil } from "../Link";
import { WrapperType, WrapperByType, LinkCardWrapper } from "./wrappers";
import { TextWithTooltip } from "../../../../components/Tooltip/TextWithTooltip";

const StateBadgeText = {
  [LibStatus.Modified]: "Modified",
  [LibStatus.Synced]: "Synced",
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

const borderedSx = (sx: ThemeUIStyleObject) => ({
  border: (t: Theme) => `1px solid ${t.colors?.border as string}`,
  bg: "transparent",
  transition: "all 200ms ease-in",
  p: 3,
  ...sx,
  "&:hover": {
    transition: "all 200ms ease-out",
    bg: "sidebar",
    border: (t: Theme) => `1px solid ${t.colors?.sidebar as string}`,
  },
});

const defaultSx = (sx: ThemeUIStyleObject) => ({
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variations: ReadonlyArray<any>;
}) => {
  return !hideVariations ? (
    <>
      {variations ? (
        <Text sx={{ fontSize: 0, color: "textClear", flexShrink: 0 }}>
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
        border: (t) => `1px solid ${t.colors?.borders as string}`,
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
      />
    </Box>
  );
};

const SliceDescription = ({
  displayStatus,
  CustomStatus,
  slice,
  wrapperType,
}: {
  displayStatus?: boolean;
  CustomStatus?: React.FC<{ slice: ComponentUI }>;
  slice: ComponentUI;
  wrapperType: WrapperType;
}) => {
  const extraSx: ThemeUIStyleObject =
    wrapperType === WrapperType.changesPage
      ? {
          justifyContent: "space-between",
          flex: "1",
          flexDirection: "row-reverse",
        }
      : {};

  return (
    <Flex mt={3} sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Flex sx={{ alignItems: "center", ...extraSx }}>
        {CustomStatus ? (
          <CustomStatus slice={slice} />
        ) : (
          <Fragment>
            {displayStatus && slice.__status ? (
              <StatusBadge libStatus={slice.__status} />
            ) : null}
          </Fragment>
        )}
        <TextWithTooltip text={slice.model.name} as="h6" />
      </Flex>
      {wrapperType !== WrapperType.changesPage && (
        <SliceVariations
          variations={slice.model.variations}
          hideVariations={false}
        />
      )}
    </Flex>
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
    CustomStatus?: React.FC<{ slice: ComponentUI }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Wrapper?: any /* ? */;
    slice: ComponentUI;
    wrapperType?: WrapperType;
    thumbnailHeightPx?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sx?: any;
  }) {
    const defaultVariation = ComponentUI.variation(slice);
    if (!defaultVariation) {
      return null;
    }
    const variationId = defaultVariation.id;
    const link = LinkUtil.variation(slice.href, slice.model.name, variationId);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const CardWrapper = Wrapper || WrapperByType[wrapperType];

    const screenshotUrl = slice?.screenshotUrls?.[variationId]?.url;

    return (
      <CardWrapper link={link} slice={slice}>
        <Themecard
          role="button"
          aria-pressed="false"
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument
          sx={bordered ? borderedSx(sx) : defaultSx(sx)}
        >
          <SliceThumbnail
            withShadow={false}
            screenshotUrl={screenshotUrl}
            heightInPx={thumbnailHeightPx}
          />
          {wrapperType === WrapperType.changesPage ? (
            <LinkCardWrapper link={link}>
              <SliceDescription
                slice={slice}
                CustomStatus={CustomStatus}
                displayStatus={displayStatus}
                wrapperType={wrapperType}
              />
            </LinkCardWrapper>
          ) : (
            <SliceDescription
              slice={slice}
              CustomStatus={CustomStatus}
              displayStatus={displayStatus}
              wrapperType={wrapperType}
            />
          )}
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slice: { key: string; value: any };
    displayStatus?: boolean;
    thumbnailHeightPx?: string;
    wrapperType?: WrapperType;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sx?: any;
  }) {
    const Wrapper = WrapperByType[wrapperType];

    return (
      <Wrapper link={undefined}>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-argument */}
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
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                {slice?.value?.fieldset || slice.key}
              </Heading>
            </Flex>
          </Flex>
        </Themecard>
      </Wrapper>
    );
  },
};
