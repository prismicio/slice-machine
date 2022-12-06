import { Image, Link, Text } from "theme-ui";
import FullPage from "../FullPage";

const FailedConnect = () => (
  <FullPage>
    <Image src="/iframe-not-running.png" sx={{ width: "320px" }} />
    <Text
      sx={{
        color: "textClear",
        mb: 2,
        fontSize: "14px",
        lineHeight: "24px",
        fontWeight: "600",
      }}
    >
      Slice Machine can't render your Slice
    </Text>
    <Text
      sx={{
        color: "#86848D",
        fontWeight: "400",
        maxWidth: "400px",
        textAlign: "center",
        fontSize: "12px",
        lineHeight: "22px",
      }}
    >
      Ensure your website's development server is running by typing
      <br />
      <Text
        as="code"
        variant="styles.inlineCode"
        sx={{ padding: "4px", borderRadius: "6px" }}
      >
        npm run dev
      </Text>
      &nbsp; in your terminal at the root of your website directory.
      <br /> If that doesn't work, see the&nbsp;
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
