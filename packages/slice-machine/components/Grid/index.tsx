import { Box } from 'theme-ui'

const Grid = ({ elems, gridTemplateMinPx = "320px", renderElem }: { elems: any, gridTemplateMinPx?: string, renderElem: Function }) => {
  return (
    <Box
      as="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${gridTemplateMinPx}, 1fr))`,
        grid: '16px',
        pt: 2,
        mb: 3
      }}
    >
      { elems.map((elem: any) => renderElem(elem) )}
    </Box>
  )

}

export default Grid
