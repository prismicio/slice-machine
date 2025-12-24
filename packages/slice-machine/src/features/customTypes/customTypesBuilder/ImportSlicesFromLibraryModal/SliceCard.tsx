import { Checkbox } from "@prismicio/editor-ui";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { Card, CardFooter, CardMedia } from "@/components/Card";

interface SliceCardProps {
  thumbnailUrl?: string;
  model: SharedSlice;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
}

export function SliceCard(props: SliceCardProps) {
  const { thumbnailUrl, model, selected = true, onSelectedChange } = props;

  const handleClick = () => {
    onSelectedChange(!selected);
  };

  const cardContent = (
    <>
      {thumbnailUrl !== undefined && thumbnailUrl ? (
        <CardMedia src={thumbnailUrl} />
      ) : (
        <CardMedia component="div" />
      )}
      <CardFooter
        title={model.name}
        action={
          <div onClick={(event) => event.stopPropagation()}>
            <Checkbox checked={selected} onCheckedChange={onSelectedChange} />
          </div>
        }
      />
    </>
  );

  return (
    <Card
      interactive={true}
      onClick={handleClick}
      checked={selected}
      size="small"
      data-testid="slice-card"
    >
      {cardContent}
    </Card>
  );
}
