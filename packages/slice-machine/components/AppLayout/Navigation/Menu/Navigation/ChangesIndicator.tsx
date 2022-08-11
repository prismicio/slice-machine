import { useRouter } from "next/router";
import { Flex } from "theme-ui";

interface ChangesIndicatorProps {
  numberOfChanges: number;
  match: (pathname: string) => boolean;
}

export const ChangesIndicator: React.FC<ChangesIndicatorProps> = ({
  numberOfChanges,
  match,
}) => {
  const router = useRouter();
  if (numberOfChanges === 0) {
    return null;
  }

  const formattedNumber = numberOfChanges > 5 ? "5+" : numberOfChanges;
  const isNavItemSelected = match(router.asPath);

  return (
    <Flex
      sx={{
        borderRadius: "50%",
        backgroundColor: isNavItemSelected ? "purpleLight01" : "purple",
        width: "24px",
        height: "24px",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "12px",
        color: isNavItemSelected ? "purple" : "white",
        fontWeight: 600,
      }}
    >
      {formattedNumber}
    </Flex>
  );
};
