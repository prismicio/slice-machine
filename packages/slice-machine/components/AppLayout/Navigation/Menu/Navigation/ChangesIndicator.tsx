import { Flex } from "theme-ui";

interface ChangesIndicatorProps {
  numberOfChanges: number;
}

export const ChangesIndicator = ({
  numberOfChanges,
}: ChangesIndicatorProps) => {
  if (numberOfChanges === 0) {
    return null;
  }
  return (
    <Flex
      sx={{
        borderRadius: "50%",
        backgroundColor: "purpleLight01",
        width: "24px",
        height: "24px",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
        color: "purple",
        fontWeight: 600,
      }}
    >
      {numberOfChanges}
    </Flex>
  );
};
