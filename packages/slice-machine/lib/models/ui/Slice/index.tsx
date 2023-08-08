import React, { useCallback } from "react";
import {
  Text,
  Card as Themecard,
  Flex,
  type ThemeUIStyleObject,
  type ThemeUICSSObject,
} from "theme-ui";
import { ComponentUI } from "../../common/ComponentUI";
import { Link as LinkUtil } from "../Link";
import { WrapperType, WrapperByType } from "./wrappers";
import { ReactTooltipPortal } from "@components/ReactTooltipPortal";
import { TextWithTooltip } from "@components/Tooltip/TextWithTooltip";
import { ScreenshotPreview } from "@components/ScreenshotPreview";
import { StatusBadge } from "@components/StatusBadge";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { AuthStatus } from "@src/modules/userContext/types";
import { AiOutlineCamera, AiOutlineExclamationCircle } from "react-icons/ai";
import { countMissingScreenshots } from "@src/utils/screenshots/missing";
import { Button } from "@components/Button";
import { KebabMenuDropdown } from "@components/KebabMenuDropdown";
import ReactTooltip from "react-tooltip";
import style from "./LegacySliceTooltip.module.css";

const defaultSx = (sx: ThemeUIStyleObject = {}): ThemeUICSSObject => ({
  bg: "white",
  position: "relative",
  transition: "all 100ms cubic-bezier(0.215,0.60,0.355,1)",
  ...sx,
});

const SliceVariations = ({
  numberOfVariations,
}: {
  numberOfVariations: number;
}) => {
  return (
    <>
      {numberOfVariations ? (
        <Text
          sx={{
            fontSize: 14,
            color: "textClear",
            flexShrink: 0,
            lineHeight: "24px",
          }}
        >
          {numberOfVariations} variation{numberOfVariations > 1 ? "s" : ""}
        </Text>
      ) : null}
    </>
  );
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
      <SliceVariations numberOfVariations={slice.model.variations.length} />
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
      children?: React.ReactNode;
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

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
          aria-label={`${slice.model.name} slice card`}
        >
          <Flex
            sx={{
              position: "relative",
              flexDirection: "column",
            }}
          >
            <ScreenshotPreview
              hideMissingWarning={isDeleted(StatusOrCustom)}
              src={screenshotUrl}
              sx={{
                height: "198px",
                borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
                borderRadius: "4px 4px 0 0",
              }}
            />
            {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
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
    slice,
    sx,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slice: { key: string; value: any };
    sx?: ThemeUIStyleObject;
  }) {
    const Wrapper = WrapperByType[WrapperType.nonClickable];

    return (
      <Wrapper
        sx={{
          borderColor: (t) => t.colors?.borders,
          "&:focus": {
            borderColor: "bordersFocused",
          },
        }}
      >
        <Themecard
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
            data-for={`legacy-slice-tooltip-${slice.key}`}
            data-tip
            sx={{
              py: 2,
              flexDirection: "row",
              justifyContent: "center",
              bg: "purple12",
              fontSize: "12px",
              fontWeight: "bold",
              color: "purple08",
              lineHeight: "16px",
            }}
          >
            Legacy Slice
          </Flex>
          <ReactTooltipPortal>
            <ReactTooltip
              id={`legacy-slice-tooltip-${slice.key}`}
              type="dark"
              border
              borderColor="black"
              place="bottom"
              effect="solid"
              clickable
              delayHide={100}
              className={style.legacySliceTooltipContainer}
            >
              <Text
                sx={{
                  fontSize: "12px",
                  lineHeight: "16px",
                }}
              >
                This Slice was created with the Legacy Builder, and is
                incompatible with Slice Machine. You cannot edit, push, or
                delete it in Slice Machine. In order to proceed, manually remove
                the Slice from your type model. Then create a new Slice with the
                same fields using Slice Machine.
              </Text>
            </ReactTooltip>
          </ReactTooltipPortal>
          <ScreenshotPreview
            hideMissingWarning
            sx={{
              height: "166px",
              borderBottom: (t) => `1px solid ${t.colors?.borders as string}`,
              borderRadius: 0,
            }}
          />
          <Flex
            p={3}
            sx={{
              flexDirection: "column",
            }}
          >
            <TextWithTooltip
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
              text={slice?.value?.fieldset || slice.key}
              as="h6"
              sx={{
                fontWeight: "600 !important",
                maxWidth: "80%",
                lineHeight: "24px !important",
                color: "grey10",
              }}
            />
            <Flex
              sx={{
                height: "28px",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <SliceVariations numberOfVariations={1} />
            </Flex>
          </Flex>
        </Themecard>
      </Wrapper>
    );
  },
};
