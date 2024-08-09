import {
  Box,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  IconButton,
  Text,
  theme,
  Tooltip,
} from "@prismicio/editor-ui";
import Link from "next/link";
import type { FC } from "react";

import { Card, CardFooter, CardMedia, CardStatus } from "@/components/Card";
import { CardProps } from "@/components/Card/Card";
import { countMissingScreenshots, getScreenshotUrl } from "@/domain/slice";
import {
  StatusBadge,
  type StatusBadgeProps,
} from "@/features/changes/StatusBadge";
import { SLICES_CONFIG } from "@/features/slices/slicesConfig";
import { AddPhotoAlternateIcon } from "@/icons/AddPhotoAlternateIcon";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";

type SharedSliceCardProps = {
  isComingSoon?: boolean;
  isDeleted?: boolean;
  onUpdateScreenshot?: () => void;
  slice: ComponentUI;
  variant: "outlined" | "solid";
  variationId?: string;
} & (
  | /*
   * Props for rendering a `Card` with a Next.js `Link` component (or with a
   * non-interactive element if either `isComingSoon` or `isDeleted` is true).
   */
  {
      mode: "navigation";
      action: Action;
      replace?: boolean;
      selected?: boolean;
    }
  // Props for rendering a `Card` with an interactive (selectable) element.
  | {
      mode: "selection";
      action: Action | { type: "checkbox" };
      onSelectedChange: (selected: boolean) => void;
      selected: boolean;
    }
);

type Action =
  | {
      type: "menu";
      onRemove: () => void;
      onRename: () => void;
      removeDisabled?: boolean;
    }
  | { type: "remove"; onRemove: () => void }
  | ({ type: "status" } & Omit<StatusBadgeProps, "modelType">);

export const SharedSliceCard: FC<SharedSliceCardProps> = (props) => {
  const {
    action,
    isComingSoon = false,
    isDeleted = false,
    onUpdateScreenshot,
    selected = false,
    slice,
    variant,
    variationId,
  } = props;

  const variation = ComponentUI.variation(slice, variationId);
  if (!variation) return null;
  const src = getScreenshotUrl(slice, variation);

  const disabled = isComingSoon || isDeleted;
  const canUpdateScreenshot = !disabled && !!onUpdateScreenshot;
  const disableOverlay = variant === "outlined";
  const hasVariationId = variationId !== undefined;

  let modeProps: CardProps;
  if (props.mode === "selection") {
    modeProps = {
      disabled,
      interactive: true,
      onClick: () => {
        props.onSelectedChange(!selected);
      },
    } as const;
  } else if (!disabled) {
    modeProps = {
      component: Link,
      href: SLICES_CONFIG.getBuilderPagePathname({
        libraryName: slice.href,
        sliceName: slice.model.name,
        variationId: variation.id,
      }),
      interactive: true,
      replace: props.replace,
    } as const;
  } else {
    modeProps = { interactive: false } as const;
  }
  const variantProps =
    variant === "outlined"
      ? ({ size: "small", variant: "outlined" } as const)
      : {};

  return (
    <Card
      aria-label={`${slice.model.name} ${variation.name} slice card`}
      checked={selected}
      data-testid="shared-slice-card"
      {...modeProps}
      {...variantProps}
    >
      {src !== undefined ? (
        <CardMedia
          alt="Preview image"
          overlay={
            canUpdateScreenshot && !disableOverlay ? (
              <Box alignItems="center" justifyContent="center">
                <UpdateScreenshotButton onClick={onUpdateScreenshot} />
              </Box>
            ) : undefined
          }
          src={src}
        />
      ) : (
        <CardMedia component="div">
          <Box
            alignItems="center"
            flexDirection="column"
            gap={8}
            justifyContent="center"
          >
            <Text color="grey11" component="span">
              No screenshot available
            </Text>
            {canUpdateScreenshot && !disableOverlay ? (
              <UpdateScreenshotButton onClick={onUpdateScreenshot} />
            ) : undefined}
          </Box>
        </CardMedia>
      )}
      <CardFooter
        action={
          action.type === "checkbox" && props.mode === "selection" ? (
            // TODO(DT-1661): `findFocusableAncestor` should find Radix UI's `Checkbox`.
            <div onClick={(event) => event.stopPropagation()}>
              <Checkbox
                checked={selected}
                disabled={disabled}
                onCheckedChange={props.onSelectedChange}
              />
            </div>
          ) : action.type === "menu" ? (
            <DropdownMenu modal>
              <DropdownMenuTrigger disabled={disabled}>
                <IconButton hiddenLabel="Slice actions" icon="moreVert" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                data-testid="slice-action-icon-dropdown"
              >
                {canUpdateScreenshot && disableOverlay ? (
                  <DropdownMenuItem
                    onSelect={onUpdateScreenshot}
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    Update screenshot
                  </DropdownMenuItem>
                ) : undefined}
                <DropdownMenuItem
                  onSelect={action.onRename}
                  startIcon={<Icon name="edit" />}
                >
                  Rename
                </DropdownMenuItem>
                {action.removeDisabled === true && hasVariationId ? (
                  <Tooltip
                    content="The slice needs to have at least one variation."
                    side="bottom"
                    stableMount
                  >
                    <RemoveDropdownMenuItem
                      disabled
                      onSelect={action.onRemove}
                    />
                  </Tooltip>
                ) : (
                  <RemoveDropdownMenuItem
                    disabled={action.removeDisabled === true}
                    onSelect={action.onRemove}
                  />
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : action.type === "remove" ? (
            <IconButton
              icon="close"
              onClick={() => !disabled && action.onRemove()}
              hiddenLabel="Remove slice"
            />
          ) : action.type === "status" ? (
            <StatusBadge
              authStatus={action.authStatus}
              isOnline={action.isOnline}
              modelStatus={action.modelStatus}
              modelType="Slice"
            />
          ) : undefined
        }
        subtitle={
          <>
            {hasVariationId
              ? variation.id
              : `${slice.model.variations.length} variation${
                  slice.model.variations.length > 1 ? "s" : ""
                }`}
            {isComingSoon ? (
              <Text color="purple11" component="span" variant="small">
                {" "}
                • (coming soon)
              </Text>
            ) : undefined}
          </>
        }
        title={hasVariationId ? variation.name : slice.model.name}
      />
      {canUpdateScreenshot &&
      !hasVariationId &&
      countMissingScreenshots(slice) > 0 ? (
        <CardStatus>Missing screenshot</CardStatus>
      ) : undefined}
    </Card>
  );
};

type UpdateScreenshotButtonProps = { onClick: () => void };

const UpdateScreenshotButton: FC<UpdateScreenshotButtonProps> = (props) => (
  <Button
    onClick={props.onClick}
    renderStartIcon={() => <AddPhotoAlternateIcon color={theme.color.grey11} />}
    color="grey"
  >
    Update screenshot
  </Button>
);

type RemoveDropdownMenuItemProps = {
  disabled: boolean;
  onSelect: () => void;
};

const RemoveDropdownMenuItem: FC<RemoveDropdownMenuItemProps> = (props) => (
  <DropdownMenuItem
    {...props}
    color="tomato"
    startIcon={<Icon name="delete" />}
  >
    Delete
  </DropdownMenuItem>
);
