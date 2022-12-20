import { Image, Link, Text } from "theme-ui";
import FullPage from "../FullPage";

import { Button } from "@components/Button";

import { IoMdRefresh } from "react-icons/io";

const FailedConnect = ({ onRetrigger }: { onRetrigger: () => void }) => (
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
        color: "failedConnectText",
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
        href="https://prismic.io/docs/slice-machine"
        sx={{
          color: "link",
        }}
      >
        troubleshooting instructions.
      </Link>
    </Text>
    <Button
      onClick={onRetrigger}
      label="Refresh"
      Icon={IoMdRefresh}
      iconSize={20}
      iconFill="#6F6E77"
      variant="secondaryMedium"
      sx={{
        mt: "16px",
      }}
    />
  </FullPage>
);

export default FailedConnect;
