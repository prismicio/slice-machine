import { Button } from "@prismicio/editor-ui";

import { Card, CardFooter, CardMedia } from "@/components/Card";

interface SliceCardProps {
  slice: Slice;
}

export function SliceCard(props: SliceCardProps) {
  const { slice } = props;

  const loading = slice.status === "uploading";
  const error = slice.status === "uploadError";

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
  | {
      status: "success";
      thumbnailUrl: string;
    }
);

function getStartIcon(status: Slice["status"]) {
  switch (status) {
    case "uploadError":
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
    case "success":
      return "Generated";
  }
}
