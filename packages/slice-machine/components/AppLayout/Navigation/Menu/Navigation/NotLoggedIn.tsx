import React from "react";
import { Box } from "theme-ui";
import { FiUserX } from "react-icons/fi";

const NotLoggedIn: React.FC = () => (
  <Box as="li">
    <FiUserX style={{ position: "relative", top: "2px" }} />
    <Box as="span" sx={{ ml: 2, fontWeight: 400 }}>
      You're not logged in!
    </Box>
  </Box>
);

export default NotLoggedIn;
