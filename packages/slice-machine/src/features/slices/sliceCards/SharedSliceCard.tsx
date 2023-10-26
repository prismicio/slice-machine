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
  tokens,
} from "@prismicio/editor-ui";
import Link from "next/link";
import type { FC } from "react";

import { ComponentUI } from "@lib/models/common/ComponentUI";
import { Card, CardFooter, CardMedia, CardStatus } from "@src/components/Card";
import { countMissingScreenshots, getScreenshotUrl } from "@src/domain/slice";
import {
  StatusBadge,
  type StatusBadgeProps,
} from "@src/features/changes/StatusBadge";
import { SLICES_CONFIG } from "@src/features/slices/slicesConfig";
import { AddPhotoAlternateIcon } from "@src/icons/AddPhotoAlternateIcon";

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
  | { type: "menu"; onRemove?: () => void; onRename?: () => void }
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

  let modeProps;
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
      data-cy={`shared-slice-card-${slice.model.id}`}
      data-testid="shared-slice-card"
      {...modeProps}
      {...variantProps}
    >
      {src !== undefined ? (
        <CardMedia
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
                <IconButton icon="moreVert" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {action.onRename ? (
                  <DropdownMenuItem
                    onSelect={action.onRename}
                    startIcon={<Icon name="edit" />}
                  >
                    Rename
                  </DropdownMenuItem>
                ) : undefined}
                {canUpdateScreenshot && disableOverlay ? (
                  <DropdownMenuItem
                    onSelect={onUpdateScreenshot}
                    startIcon={<AddPhotoAlternateIcon />}
                  >
                    Update screenshot
                  </DropdownMenuItem>
                ) : undefined}
                {action.onRemove ? (
                  <DropdownMenuItem
                    color="tomato"
                    onSelect={action.onRemove}
                    startIcon={<Icon name="delete" />}
                  >
                    Delete
                  </DropdownMenuItem>
                ) : undefined}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : action.type === "remove" ? (
            <IconButton
              icon="close"
              onClick={() => !disabled && action.onRemove()}
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
    renderStartIcon={() => (
      <AddPhotoAlternateIcon color={tokens.color.greyLight11} />
    )}
    variant="secondary"
  >
    Update screenshot
  </Button>
);
