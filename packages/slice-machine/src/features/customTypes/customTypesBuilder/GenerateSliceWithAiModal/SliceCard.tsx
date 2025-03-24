import { Button } from "@prismicio/editor-ui";

import { Card, CardFooter, CardMedia } from "@/components/Card";

interface SliceCardProps {
  slice: Slice;
  onRetry?: () => void;
}

export function SliceCard(props: SliceCardProps) {
  const { slice, onRetry } = props;

  const loading = slice.status === "uploading";
  const error = slice.status === "uploadingError";

  return (
    <Card disabled={loading} style={{ width: 394 }}>
      {slice.status === "success" ? (
        <CardMedia src={slice.thumbnailUrl} />
      ) : (
        <CardMedia component="div" />
      )}
      <CardFooter
        loading={loading}
        startIcon={getStartIcon(slice.status)}
        title={slice.image.name}
        subtitle={getSubtitle(slice.status)}
        error={error}
        action={
          error ? (
            <Button startIcon="refresh" color="grey" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      />
    </Card>
  );
}

export type Slice =
  | { status: "uploading"; image: File }
  | { status: "uploadingError"; image: File }
  | {
      status: "success";
      thumbnailUrl: string;
      image: File;
    };

function getStartIcon(status: Slice["status"]) {
  switch (status) {
    case "uploadingError":
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
    case "uploadingError":
      return "Unable to upload image";
    case "success":
      return "Generated";
  }
}
