import { Box, Checkbox, Text } from "@prismicio/editor-ui";
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
          </Box>
        </CardMedia>
      )}
      <CardFooter
        title={model.name}
        subtitle={
          model.variations.length > 1
            ? `${model.variations.length} variations`
            : `1 variation`
        }
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
