import { Card, CardFooter, CardMedia } from "@/components/Card";

interface SliceCardProps {
  slice: Slice;
}

export function SliceCard(props: SliceCardProps) {
  const { slice } = props;

  return (
    <Card disabled={slice.status === "loading"} style={{ width: 394 }}>
      {Boolean(slice.thumbnailUrl) ? (
        <CardMedia src={slice.thumbnailUrl} />
      ) : (
        <CardMedia component="div" />
      )}
      <CardFooter
        loading={slice.status === "loading"}
        startIcon={getStartIcon(slice.status)}
        title={slice.displayName}
        subtitle={getSubtitle(slice.status)}
      />
    </Card>
  );
}
export interface Slice {
  status: "loading" | "success" | "error";
  displayName: string;
  thumbnailUrl?: string;
  image: File;
}

function getStartIcon(status: Slice["status"]) {
  switch (status) {
    case "success":
      return "check";
    case "error":
      return "warning";
    default:
      return undefined;
  }
}

function getSubtitle(status: Slice["status"]) {
  switch (status) {
    case "loading":
      return "Generating...";
    case "success":
      return "Generated";
    case "error":
      return "Error";
  }
}
