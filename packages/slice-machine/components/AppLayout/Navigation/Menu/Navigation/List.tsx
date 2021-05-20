import { Box } from "theme-ui";
import Item from "./Item";
import { LinkProps } from "components/AppLayout/Navigation";

const ItemsList = ({ mt, links }: { mt?: number; links: LinkProps[] }) => {
  return (
    <Box as="nav" marginTop={mt}>
      <Box as="ul">
        {links.map((link: LinkProps, i) =>
          link.delimiter ? (
            <Box>
              <Box as="hr" mb="10px" />
              <Item key={`${link} - ${i}`} link={link} />
            </Box>
          ) : (
            <Item key={`${link} - ${i}`} link={link} />
          )
        )}
      </Box>
    </Box>
  );
};

export default ItemsList;
