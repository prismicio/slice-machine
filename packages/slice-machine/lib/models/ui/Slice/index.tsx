import React, { useCallback } from "react";
import {
  Theme,
  Text,
  Card as Themecard,
  Heading,
  Flex,
  Badge,
  ThemeUICSSObject,
} from "theme-ui";
import { ThemeUIStyleObject } from "@theme-ui/css";
import { ComponentUI } from "../../common/ComponentUI";
import { Link as LinkUtil } from "../Link";
import { WrapperType, WrapperByType } from "./wrappers";
import { TextWithTooltip } from "@components/Tooltip/TextWithTooltip";
import { ScreenshotPreview } from "@components/ScreenshotPreview";
import { StatusBadge } from "@components/StatusBadge";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { AuthStatus } from "@src/modules/userContext/types";
import { AiOutlineCamera, AiOutlineExclamationCircle } from "react-icons/ai";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { Button } from "@components/Button";
import { KebabMenuDropdown } from "@components/KebabMenuDropdown";

const borderedSx = (sx: ThemeUIStyleObject = {}): ThemeUICSSObject => ({
  bg: "transparent",
  transition: "all 200ms ease-in",
  p: 3,
  position: "relative",
  ...sx,
  "&:hover": {
    transition: "all 200ms ease-out",
    bg: "sidebar",
    border: (t: Theme) => `1px solid ${t.colors?.sidebar as string}`,
  },
});

const defaultSx = (sx: ThemeUIStyleObject = {}): ThemeUICSSObject => ({
  bg: "transparent",
  position: "relative",
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
        <Text
          sx={{
            fontSize: 14,
            color: "textClear",
            flexShrink: 0,
            lineHeight: "24px",
          }}
        >
          {variations.length} variation{variations.length > 1 ? "s" : ""}
        </Text>
      ) : null}
    </>
  ) : null;
};

const SliceCardActions: React.FC<{
  slice: ComponentUI;
  disableActions: boolean;
  actions?: {
    onUpdateScreenshot: (e: React.MouseEvent) => void;
    openRenameModal?: (slice: ComponentUI) => void;
    openDeleteModal?: (slice: ComponentUI) => void;
  };
}> = ({ actions, slice, disableActions }) => {
  const onRenameClick = useCallback(() => {
    if (actions?.openRenameModal) {
      actions.openRenameModal(slice);
    }
  }, [actions, slice]);
  const onDeleteClick = useCallback(() => {
    if (actions?.openDeleteModal) {
      actions.openDeleteModal(slice);
    }
  }, [actions, slice]);

  if (!actions) {
    return null;
  }

  return (
    <Flex
      mt={1}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        padding: 3,
        borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
        mt: 0,
      }}
    >
      <Button
        onClick={actions.onUpdateScreenshot}
        variant="secondarySmall"
        sx={{ fontWeight: "bold" }}
        Icon={AiOutlineCamera}
        label="Update screenshot"
        disabled={disableActions}
      />

      {actions.openRenameModal && (
        <KebabMenuDropdown
          dataCy="slice-action-icon"
          menuOptions={[
            {
              displayName: "Rename",
              onClick: onRenameClick,
              dataCy: "slice-action-rename",
            },
            {
              displayName: "Delete",
              onClick: onDeleteClick,
            },
          ]}
        />
      )}
    </Flex>
  );
};
const SliceDescription = ({
  slice,
  StatusOrCustom,
}: {
  slice: ComponentUI;
  StatusOrCustom:
    | {
        status: ModelStatus;
        authStatus: AuthStatus;
        isOnline: boolean;
      }
    | React.FC<{ slice: ComponentUI }>;
}) => (
  <Flex
    sx={{
      flexDirection: "column",
      padding: 3,
    }}
  >
    <Flex>
      <TextWithTooltip
        text={slice.model.name}
        as="h6"
        sx={{
          fontWeight: "600 !important",
          maxWidth: "80%",
          lineHeight: "24px !important",
        }}
      />
    </Flex>
    <Flex
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <SliceVariations
        variations={slice.model.variations}
        hideVariations={false}
      />
      <Flex sx={{ alignItems: "center" }}>
        {"status" in StatusOrCustom ? (
          <StatusBadge
            modelType="Slice"
            modelId={slice.model.id}
            status={StatusOrCustom.status}
            authStatus={StatusOrCustom.authStatus}
            isOnline={StatusOrCustom.isOnline}
          />
        ) : (
          <StatusOrCustom slice={slice} />
        )}
      </Flex>
    </Flex>
  </Flex>
);

const ScreenshotMissingBanner: React.FC<{ slice: ComponentUI }> = ({
  slice,
}) => {
  const missingScreenshots = countMissingScreenshots(slice);

  if (!missingScreenshots) {
    return null;
  }

  return (
    <Flex
      sx={{
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        bg: "missingScreenshotBanner.bg",
        color: "missingScreenshotBanner.color",
        width: "100%",
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: "600",
      }}
    >
      <AiOutlineExclamationCircle size={16} style={{ marginRight: "8px" }} />{" "}
      {missingScreenshots}/{slice.model.variations.length} screenshots missing
    </Flex>
  );
};

type Status = {
  status: ModelStatus;
  authStatus: AuthStatus;
  isOnline: boolean;
};
type StatusOrCustom = Status | React.FC<{ slice: ComponentUI }>;

const isDeleted = (statusOrCustom: StatusOrCustom): boolean =>
  "status" in statusOrCustom && statusOrCustom.status === ModelStatus.Deleted;

export const SharedSlice = {
  render({
    showActions,
    slice,
    Wrapper,
    StatusOrCustom,
    wrapperType = WrapperType.clickable,
    actions,
    sx,
  }: {
    showActions?: boolean;
    slice: ComponentUI;
    StatusOrCustom: StatusOrCustom;
    Wrapper?: React.FC<{
      link?: { as: string };
      slice: ComponentUI;
      sx?: ThemeUIStyleObject;
    }>;
    wrapperType?: WrapperType;
    actions?: {
      onUpdateScreenshot: (e: React.MouseEvent) => void;
      openRenameModal?: (slice: ComponentUI) => void;
      openDeleteModal?: (slice: ComponentUI) => void;
    };
    sx?: ThemeUIStyleObject;
  }) {
    const defaultVariation = ComponentUI.variation(slice);
    if (!defaultVariation) {
      return null;
    }
    const variationId = defaultVariation.id;
    const link = LinkUtil.variation(slice.href, slice.model.name, variationId);

    const CardWrapper = Wrapper || WrapperByType[wrapperType];

    const screenshotUrl = slice.screenshots?.[variationId]?.url;

    return (
      <CardWrapper
        link={link}
        slice={slice}
        sx={{
          borderColor: (t) => t.colors?.borders,
          "&:focus": {
            borderColor: "bordersFocused",
          },
        }}
      >
        <Themecard
          role="button"
          aria-pressed="false"
          sx={{
            borderColor: "inherit",
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: "6px",
            overflow: "hidden",
            ...defaultSx(sx),
          }}
        >
          <Flex
            sx={{
              position: "relative",
              flexDirection: "column",
            }}
          >
            <ScreenshotPreview
              deleted={isDeleted(StatusOrCustom)}
              src={screenshotUrl}
              sx={{
                height: "198px",
                borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
                borderRadius: "4px 4px 0 0",
              }}
            />
            {showActions && !isDeleted(StatusOrCustom) ? (
              <ScreenshotMissingBanner slice={slice} />
            ) : null}
            <Flex
              sx={{
                flexDirection: "column",
              }}
            >
              <SliceCardActions
                slice={slice}
                disableActions={isDeleted(StatusOrCustom)}
                actions={actions}
              />
              <SliceDescription slice={slice} StatusOrCustom={StatusOrCustom} />
            </Flex>
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
    thumbnailHeightPx = "290px",
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
          <ScreenshotPreview
            sx={{
              height: thumbnailHeightPx,
              borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
              borderRadius: "4px 4px 0 0",
            }}
          />
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
