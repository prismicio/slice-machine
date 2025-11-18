import { Button, Tooltip } from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { ReactNode } from "react";

import { Card, CardFooter, CardMedia } from "@/components/Card";
import { FigmaIcon } from "@/icons/FigmaIcon";

interface SliceCardProps {
  slice: Slice;
}

export function SliceCard(props: SliceCardProps) {
  const { slice } = props;

  const loading = slice.status === "uploading" || slice.status === "generating";

  const error =
    slice.status === "uploadError" || slice.status === "generateError";

  const hasThumbnail =
    slice.status === "pending" ||
    slice.status === "generateError" ||
    slice.status === "generating" ||
    slice.status === "success";

  let action: ReactNode | undefined;
  if (error) {
    action = (
      <Button startIcon="refresh" color="grey" onClick={slice.onRetry}>
        Retry
      </Button>
    );
  } else if (slice.source === "figma") {
    action = (
      <Tooltip content="Pasted from Figma">
        <FigmaIcon variant="square" />
      </Tooltip>
    );
  }

  return (
    <Card disabled={loading}>
      {hasThumbnail ? (
        <CardMedia src={slice.thumbnailUrl} />
      ) : (
        <CardMedia component="div" />
      )}
      <CardFooter
        loading={loading}
        startIcon={getStartIcon(slice.status)}
        title={getTitle(slice)}
        subtitle={getSubtitle(slice)}
        error={error}
        action={action}
      />
    </Card>
  );
}

export type Slice = { image: File; source: "upload" | "figma" } & (
  | { status: "uploading" }
  | { status: "uploadError"; onRetry: () => void }
  | { status: "pending"; thumbnailUrl: string }
  | { status: "generating"; thumbnailUrl: string }
  | { status: "generateError"; thumbnailUrl: string; onRetry: () => void }
  | {
      status: "success";
      thumbnailUrl: string;
      model: SharedSlice;
      langSmithUrl?: string;
    }
);

function getTitle(slice: Slice) {
  if (slice.status === "success") {
    return slice.model.name;
  }
  if (slice.source === "figma") {
    return slice.image.name.split(".")[0];
  }
  return slice.image.name;
}

function getStartIcon(status: Slice["status"]) {
  switch (status) {
    case "uploadError":
    case "generateError":
      return "close";
    case "pending":
      return "image";
    case "success":
      return "check";
    default:
      return undefined;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} kB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getSubtitle(slice: Slice) {
  switch (slice.status) {
    case "uploading":
      return "Uploading...";
    case "pending":
      return formatFileSize(slice.image.size);
    case "uploadError":
      return "Unable to upload image";
    case "generating":
      return "Generating...";
    case "generateError":
      return "Something went wrong";
    case "success":
      return "Generated";
  }
}
