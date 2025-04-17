import { Button } from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { Card, CardFooter, CardMedia } from "@/components/Card";

interface SliceCardProps {
  slice: Slice;
}

export function SliceCard(props: SliceCardProps) {
  const { slice } = props;

  const loading = slice.status === "uploading" || slice.status === "generating";

  const error =
    slice.status === "uploadError" || slice.status === "generateError";

  const hasThumbnail =
    slice.status === "generateError" ||
    slice.status === "generating" ||
    slice.status === "success";

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
        title={slice.status === "success" ? slice.model.name : slice.image.name}
        subtitle={getSubtitle(slice.status)}
        error={error}
        action={
          error ? (
            <Button startIcon="refresh" color="grey" onClick={slice.onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      />
    </Card>
  );
}

export type Slice = { image: File } & (
  | { status: "uploading" }
  | { status: "uploadError"; onRetry: () => void }
  | { status: "generating"; thumbnailUrl: string }
  | { status: "generateError"; thumbnailUrl: string; onRetry: () => void }
  | {
      status: "success";
      thumbnailUrl: string;
      model: SharedSlice;
      langSmithUrl?: string;
    }
);

function getStartIcon(status: Slice["status"]) {
  switch (status) {
    case "uploadError":
    case "generateError":
      return "close";
    case "success":
      return "check";
    default:
      return undefined;
  }
}

function getSubtitle(status: Slice["status"]) {
  switch (status) {
    case "uploading":
      return "Uploading...";
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
