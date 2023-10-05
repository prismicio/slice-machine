import {
  Box,
  Button,
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

type SharedSliceViewCardProps = {
  action:
    | { type: "menu"; onRemove: () => void; onRename: () => void }
    | { type: "remove"; onRemove: () => void }
    | ({ type: "status" } & Omit<StatusBadgeProps, "modelType">);
  isDeletedSlice: boolean;
  onUpdateScreenshot: (() => void) | undefined;
  slice: ComponentUI;
};

export const SharedSliceViewCard: FC<SharedSliceViewCardProps> = ({
  action,
  isDeletedSlice,
  onUpdateScreenshot,
  slice,
}) => {
  const defaultVariation = ComponentUI.variation(slice);
  if (!defaultVariation) return null;
  const href = SLICES_CONFIG.getBuilderPagePathname({
    libraryName: slice.href,
    sliceName: slice.model.name,
    variationId: defaultVariation.id,
  });
  const src = getScreenshotUrl(slice, defaultVariation);
  const canUpdateScreenshot = !!onUpdateScreenshot && !isDeletedSlice;
  return (
    <Card
      {...(href !== undefined && !isDeletedSlice
        ? { component: Link, href, interactive: true }
        : { interactive: false })}
    >
      {src !== undefined ? (
        <CardMedia
          overlay={
            canUpdateScreenshot ? (
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
            {canUpdateScreenshot ? (
              <UpdateScreenshotButton onClick={onUpdateScreenshot} />
            ) : undefined}
          </Box>
        </CardMedia>
      )}
      <CardFooter
        action={
          action.type === "menu" ? (
            <DropdownMenu modal>
              <DropdownMenuTrigger>
                <IconButton icon="moreVert" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={action.onRename}
                  startIcon={<Icon name="edit" />}
                >
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  color="tomato"
                  onSelect={action.onRemove}
                  startIcon={<Icon name="delete" />}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : action.type === "remove" ? (
            <IconButton icon="close" onClick={action.onRemove} />
          ) : (
            <StatusBadge
              authStatus={action.authStatus}
              isOnline={action.isOnline}
              modelStatus={action.modelStatus}
              modelType="Slice"
            />
          )
        }
        subtitle={`${slice.model.variations.length} variation${
          slice.model.variations.length > 1 ? "s" : ""
        }`}
        title={slice.model.name}
      />
      {canUpdateScreenshot && countMissingScreenshots(slice) > 0 ? (
        <CardStatus>Missing screenshot</CardStatus>
      ) : undefined}
    </Card>
  );
};

type UpdateScreenshotButtonProps = {
  onClick: () => void;
};

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
