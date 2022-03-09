import { Button, Text, Heading, Flex } from "theme-ui";

interface Props {
  title: string;
  onCreateNew: () => void;
  buttonText: string;
  documentationComponent: React.ReactNode;
}

const EmptyState: React.FunctionComponent<Props> = ({
  title,
  onCreateNew,
  buttonText,
  documentationComponent,
}) => (
  <Flex
    sx={(theme) => ({
      maxWidth: "480px",
      flexDirection: "column",
      border: `1px solid ${theme.colors?.grey01 as string}`,
    })}
  >
    <Flex
      sx={(theme) => ({
        flexDirection: "column",
        p: 4,
        borderBottom: `1px solid ${theme.colors?.grey01 as string}`,
      })}
    >
      <Heading
        as={"h3"}
        variant={"heading"}
        sx={{ fontSize: "16px", lineHeight: "24px", mb: 2 }}
      >
        {title}
      </Heading>
      <Text variant="xs" sx={{ lineHeight: "24px", fontSize: "13px" }}>
        {documentationComponent}
      </Text>
    </Flex>
    <Flex
      sx={{
        p: 4,
        alignItems: "center",
      }}
    >
      <Button
        onClick={onCreateNew}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mr: 4,
        }}
      >
        {buttonText}
      </Button>
      <Text
        sx={{
          fontSize: "12px",
          color: "grey04",
          maxWidth: "280px",
        }}
      >
        It will be stored locally and you will be able to push it to your
        repository
      </Text>
    </Flex>
  </Flex>
);

export default EmptyState;
