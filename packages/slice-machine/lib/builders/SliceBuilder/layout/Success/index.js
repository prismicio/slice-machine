import { Box, Heading, Close } from "theme-ui";

const Variants = {
  error: "error",
  done: "success",
  warning: "warning",
};

const Success = ({ data, onClose, display = false }) => {
  const variant = (() => {
    if (data.error) {
      return Variants.error;
    }
    return data.warning ? Variants.warning : Variants.done;
  })();

  return display ? (
    <Box
      variant="styles.success"
      sx={{ position: "absolute", top: "48px", bg: variant }}
    >
      <Box sx={{ display: "inline" }}>
        <Heading as="h5" sx={{ color: "#FFF", textAlign: "center" }}>
          {data.message}
        </Heading>
      </Box>
      <Close
        onClick={onClose}
        sx={{
          position: "absolute",
          right: "22px",
          top: "2px",
          color: "#FFF",
        }}
      />
    </Box>
  ) : null;
};

export default Success;
