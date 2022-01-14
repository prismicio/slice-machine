import React from "react";
import { Box } from "theme-ui";
import Item from "./Item";
import { LinkProps } from "components/AppLayout/Navigation";

interface ItemsListProps {
  links: LinkProps[];
  mt?: number;
}

const ItemsList: React.FC<ItemsListProps> = ({ mt, links }) => (
  <Box as="nav" marginTop={mt}>
    <Box as="ul">
      {links.map((link: LinkProps, i) => (
        <Item key={`${link.title} - ${i}`} link={link} />
      ))}
    </Box>
  </Box>
);

export default ItemsList;
