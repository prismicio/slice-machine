import { Box } from "theme-ui";

const Grid = ({
  elems,
  gridTemplateMinPx = "320px",
  renderElem,
}: {
  elems: any;
  gridTemplateMinPx?: string;
  renderElem: Function;
}) => {
  return (
    <Box
      as="section"
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${gridTemplateMinPx}, 1fr))`,
        gridGap: "16px" as any,
        pt: 2,
        mb: 3,
      }}
    >
      {elems.map((elem: any, i: number) => (
        <span key={`list-item-${i + 1}`}>{renderElem(elem, i)}</span>
      ))}
    </Box>
  );
};

export default Grid;
