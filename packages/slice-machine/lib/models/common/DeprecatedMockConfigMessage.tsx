import { useRouter } from "next/router";
import { Box, Button, Text } from "theme-ui";
import { SIMULATOR_WINDOW_ID } from "@lib/consts";
import { MdErrorOutline } from "react-icons/md";

export const DeprecatedMockConfigMessage = () => {
  const router = useRouter();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px",
      }}
    >
      <MdErrorOutline size={48} color="#C9D0D8" />
      <Box sx={{ height: "12px" }} />
      <Text
        color="text"
        sx={{
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "32px",
          textAlign: "center",
        }}
      >
        Your mock data has moved
      </Text>
      <Box sx={{ height: "8px" }} />
      <Text
        color="text"
        sx={{
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "24px",
          textAlign: "center",
        }}
      >
        You can now edit directly your mock data in the new Slice Simulator.
      </Text>
      <Box sx={{ height: "24px" }} />
      <Button
        onClick={(event) => {
          event.preventDefault();
          window.open(`${router.asPath}/simulator`, SIMULATOR_WINDOW_ID);
        }}
      >
        Go to the Slice Simulator
      </Button>
    </Box>
  );
};
