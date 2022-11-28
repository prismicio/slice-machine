import { Heading, Link, Text } from "theme-ui";
import FullPage from "../FullPage";

const FailedConnect = () => (
  <FullPage>
    <Heading as="h3" sx={{ color: "textClear", mb: 2 }}>
      Slice Machine can't render your Slice
    </Heading>
    <Text
      sx={{ color: "greyIcon", mt: 1, maxWidth: "500px", textAlign: "center" }}
    >
      Ensure your website's development server is running by typing{" "}
      <Text as="code" variant="styles.inlineCode">
        npm run dev
      </Text>
      &nbsp; in your terminal at the root of your website directory. If that
      doesn't work, see the&nbsp;
      <Link
        target="_blank"
        href="https://prismic.io"
        sx={{
          color: "link",
        }}
      >
        troubleshooting instructions.
      </Link>
    </Text>
  </FullPage>
);

export default FailedConnect;
