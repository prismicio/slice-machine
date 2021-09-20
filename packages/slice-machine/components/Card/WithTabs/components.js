import { Box, useThemeUI } from "theme-ui";
import { Tab } from "react-tabs";

export const CustomTabList = ({ children, ...otherProps }) => (
  <Box
    as="ul"
    sx={{
      p: 0,
      m: 0,
      px: (theme) => `calc(${theme.space[3]}px + 8px)`,
      borderBottom: `1px solid #DFE1E5`,
      bg: "headSection",
      position: "relative",
    }}
    {...otherProps}
  >
    {children}
  </Box>
);

CustomTabList.tabsRole = "TabList";

export const CustomTab = ({ children, ...otherProps }) => {
  const { theme } = useThemeUI();
  return (
    <Tab
      {...otherProps}
      style={{
        margin: "0 32px 0 0",
        top: "0",
        padding: "8px 0px",
        border: "none",
        bottom: "-1px",
        border: "none",
        opacity: "0.8",
        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
        borderRadius: "0",
        ...(otherProps.selected
          ? {
              borderBottom: `3px solid ${theme.colors.primary}`,
              color: theme.colors.text,
              fontWeight: "500",
              opacity: "1",
              backgroundColor: theme.colors.headSection,
            }
          : {
              borderBottom: "3px solid transparent",
            }),
      }}
    >
      {children}
    </Tab>
  );
};

CustomTab.tabsRole = "Tab";
