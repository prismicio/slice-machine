import type React from "react";
import { Box } from "theme-ui";

export const MissingLibraries: React.FC = () => (
  <Box>
    <p>
      We could not find any local library in your project.
      <br />
      Please update your `sm.json` file with a path to slices, eg:
    </p>
    <p>
      <pre>{`{ "libraries": ["@/slices"] }`}</pre>
      and create the <b>slices</b> folder at the root of your project.
    </p>
  </Box>
);
