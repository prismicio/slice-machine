import { useThemeUI } from "theme-ui";
import ReactTooltip from "react-tooltip";

import { ReactTooltipPortal } from "@components/ReactTooltipPortal";

const Tooltip = (props) => {
  const { theme, colorMode } = useThemeUI();
  return (
    <ReactTooltipPortal>
      <ReactTooltip
        border
        multiline
        borderColor={theme.colors.borders}
        place="top"
        type={colorMode === "dark" ? "dark" : "light"}
        {...props}
      />
    </ReactTooltipPortal>
  );
};

export default Tooltip;
