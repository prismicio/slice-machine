import { Text } from "@prismicio/editor-ui";
import { Flex } from "theme-ui";

export function Hint(args: { show: boolean }) {
  if (!args.show) return null;

  return (
    <Flex
      sx={{
        p: 2,
        px: 3,
        alignItems: "center",
        borderTop: "1px solid",
        borderColor: "borders",
        justifyContent: "space-between",
      }}
    >
      <Text variant="normal" color="grey11">
        No code snippet for this field.{" "}
        <a
          href="https://prismic.io/docs/fields/content-relationship"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
          }}
        >
          Check the docs
        </a>{" "}
        for an example.
      </Text>
    </Flex>
  );
}
