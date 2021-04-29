import { Box } from "@theme-ui/components";

const Burger = ({ open }: { open: any }) => {
  return (
    <Box
      sx={{
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "16px",
        width: "24px",
        color: "text",
        transform: open ? "rotate(-90deg)" : "none",
        transition: "all 0.4s cubic-bezier(0, 0, 0, 1) 0s",
      }}
    >
      <Box
        sx={{
          transition: "all 0.4s cubic-bezier(0, 0, 0, 1) 0s",
          background: "currentcolor",
          height: "2px",
          transform: open ? "rotate(-45deg) translate(-5px, 5px)" : "none",
        }}
      />
      <Box
        sx={{
          transition: "all 0.4s cubic-bezier(0, 0, 0, 1) 0s",
          background: "currentcolor",
          height: "2px",
          transform: open ? "scaleX(0)" : "none",
        }}
      />
      <Box
        sx={{
          transition: "all 0.4s cubic-bezier(0, 0, 0, 1) 0s",
          background: "currentcolor",
          height: "2px",
          transform: open ? "rotate(45deg) translate(-5px, -5px)" : "none",
        }}
      />
    </Box>
  );
};

export default Burger;
