import { Box } from "theme-ui";
import Item, { LinkProps } from "./Item";

const ItemsList = ({ mt, links }: { mt?: number; links: LinkProps[] }) => {
  return (
    <Box as="nav" marginTop={mt}>
      <Box as="ul">
        {links.map((link: any) => (
          <Item link={link} />
        ))}
      </Box>
    </Box>
  );
};

export default ItemsList;
