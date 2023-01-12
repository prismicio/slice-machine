import React from "react";
import { type ThemeUIStyleObject, Box } from "theme-ui";
import Item from "./Item";
import { LinkProps } from "components/AppLayout/Navigation";

interface ItemsListProps {
  links: LinkProps[];
  sx?: ThemeUIStyleObject;
  mt?: number;
}

const ItemsList: React.FC<ItemsListProps> = ({ mt, links, sx }) => (
  <Box as="nav" marginTop={mt} sx={sx}>
    <Box as="ul">
      {links.map((link: LinkProps, i) => (
        <Item key={`${link.title} - ${i}`} link={link} />
      ))}
    </Box>
  </Box>
);

export default ItemsList;
