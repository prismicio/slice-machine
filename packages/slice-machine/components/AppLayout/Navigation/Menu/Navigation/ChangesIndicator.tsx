import { Flex } from "theme-ui";

interface ChangesIndicatorProps {
  numberOfChanges: number;
}

export const ChangesIndicator = ({
  numberOfChanges,
}: ChangesIndicatorProps) => {
  return (
    <Flex
      sx={{
        borderRadius: "50%",
        backgroundColor: "#6548FF1A",
        width: "24px",
        height: "24px",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
        color: "#5D40F7E5",
        fontWeight: 600,
      }}
    >
      {numberOfChanges}
    </Flex>
  );
};
