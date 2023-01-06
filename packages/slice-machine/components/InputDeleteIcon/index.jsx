import { IconButton, useThemeUI } from "theme-ui";
import { AiFillCloseCircle } from "react-icons/ai";

const InputDeleteIcon = ({ sx, size = 22, ...rest }) => {
  const { theme } = useThemeUI();

  return (
    <IconButton
      type="button"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sx={{
        position: "absolute",
        top: "29px",
        right: "4px",
        p: 1,
        cursor: "pointer",
        zIndex: 1,
        ...sx,
      }}
      {...rest}
    >
      <AiFillCloseCircle size={size} color={theme.colors.textClear} />
    </IconButton>
  );
};

export default InputDeleteIcon;
