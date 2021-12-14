import { darken, lighten } from "@theme-ui/color";

import { Theme } from "theme-ui";

interface MyTheme extends Theme {
  codeColor: {
    [x: string]: string;
  };
}

const AppTheme = (): Theme =>
  ({
    codeColor: {
      border: "#DFE1E5",
      blue: "#3B41BD",
      gray: "#667587",
      orange: "#EA6D46",
      green: "#3AB97A",
    },
    initialColorModeName: "light",
    colors: {
      text: "#25252D",
      textClear: "#4E4E55",
      grayLight: "#E8E8ED",
      hoverBackground: "#f2f2f2",
      background: "#FFF",
      backgroundClear: "#FFF",
      zoneHeader: "#E6E6EA",
      primary: "#6E52FF",
      purpleLight: "#F6F1FC",
      badge: {
        published: {
          bg: "#E9F6EE",
          color: "#27AE60",
        },
        new: {
          bg: "#F6F1FC",
          color: "#AC7EE9",
        },
        modified: {
          bg: "#FDF4EC",
          color: "#F2994A",
        },
      },
      codeBlockBorder: "#545454",
      secondary: "#F9FAFB",
      highlight: "hsl(10, 40%, 90%)",
      purple: "hsl(250, 60%, 30%)",
      muted: "#F9F9FB",
      icons: "#8091A5",
      gray: "#F8F9FA",
      grey01: "#F3F5F7",
      grey04: "#9AA4AF",
      textGray: "#667587",
      borders: "#C9D0D8",
      deep: "#0E2150",
      deep1: "#A0ADE7",
      deep1: "#A0ADE7",
      greenLighter: "#EBF8F1",
      orangeLighter: "#FDF4EC",
      error: "#E55737",
      success: "#3AB97A",
      headSection: "#fff",
      warning: "#E67E22",
      sidebar: "#F1F1F4",
      link: "#5163BA",
      choggleBox: "#5163BA",
      code: {
        border: "#DFE1E5",
        blue: "#3B41BD",
        gray: "#667587",
        orange: "#EA6D46",
        green: "#3AB97A",
      },

      modes: {
        dark: {
          text: "#fff",
          textClear: "#6E707B",
          hoverBackground: "#202020",
          zoneHeader: "#E6E6EA",
          background: "#202022",
          backgroundClear: "#28282C",
          primary: "#4E54D7",
          secondary: "#28282C",
          icons: "#5D5D71",
          gray: "#1D1D1F",
          borders: "#3A3A46",
          deep: "#28282C",
          headSection: "#28282C",
          warning: "#E67E22",
          sidebar: "#28282C",
          code: {
            border: "#5D5D6F",
            blue: "#3B41BD",
            gray: "#667587",
            orange: "#EA6D46",
            green: "#3AB97A",
          },
          link: "#A9A9C6",
          choggleBox: "#fff",
        },
      },
    },
    fonts: {
      body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      heading: "inherit",
      monospace: "Menlo, monospace",
    },
    fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
    breakpoints: ["40em", "56em", "64em"],
    fontWeights: {
      thin: 300,
      body: 400,
      heading: 500,
      label: 500,
      display: 900,
    },
    lineHeights: {
      body: 1.5,
      heading: 1.25,
    },
    textStyles: {
      heading: {
        fontFamily: "heading",
        fontWeight: "heading",
        lineHeight: "heading",
      },
      display: {
        variant: "textStyles.heading",
        fontSize: [5, 6],
        fontWeight: "display",
        letterSpacing: "-0.03em",
        mt: 3,
      },
    },
    sizes: {
      leftSidebar: 220,
      sidebar: 340,
    },
    text: {
      xs: {
        fontWeight: "400",
        color: "textClear",
        fontSize: 1,
      },
      small: {
        fontWeight: "500",
        fontSize: 2,
      },
      labelError: {
        color: "error",
        fontWeight: "body",
        fontSize: 1,
        margin: 0,
        pl: 2,
      },
    },
    badges: {
      PUBLISHED: {
        fontWeight: "body",
        color: "badge.published.color",
        bg: "badge.published.bg",
        px: 1,
        py: "1px",
      },
      NEW_SLICE: {
        fontWeight: "body",
        color: "badge.new.color",
        bg: "badge.new.bg",
        px: 1,
        py: "1px",
      },
      MODIFIED: {
        fontWeight: "body",
        color: "badge.modified.color",
        bg: "badge.modified.bg",
        px: 1,
        py: "1px",
      },
      circle: {
        borderRadius: "50%",
        fontSize: "10px",
      },
      primary: {
        color: "text",
        bg: "primary",
      },
      "circle-right": {
        top: "-8px",
        right: "-8px",
        height: "24px",
        width: "24px",
        display: "flex",
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
      },
      outline: {
        color: "primary",
        fontSize: "14px",
        fontWeight: "500",
        bg: "transparent",
        border: "none",
        borderColor: "borders",
      },
    },
    buttons: {
      primary: {
        color: "white",
        fontSize: 1,
        fontWeight: "body",
        bg: "primary",
        boxShadow:
          "0px 1px 0px rgba(0, 0, 0, 0.1), inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
        userSelect: "none",
        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
        "&:hover": {
          bg: darken("primary", 0.02),
          cursor: "pointer",
          boxShadow:
            "0px 1px 0px rgba(0, 0, 0, 0.1), inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
        },
        "&:focus": {
          boxShadow: "0 0 0 1px #fff, 0 0 0 3px rgb(110, 82, 255, 1)",
          bg: darken("primary", 0.02),
          outline: "none",
        },
        "&:disabled": {
          bg: lighten("primary", 0.2),
        },
        "&:active": {
          boxShadow:
            "0px 1px 0px rgba(0, 0, 0, 0.1), inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
          bg: darken("primary", 0.05),
          borderColor: darken("primary", 0.08),
          outline: "none",
        },
      },
      screenSize: {
        p: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "32px",
        width: "32px",
        bg: "text",
        color: "white",
        cursor: "pointer",
        boxShadow:
          "0px 1px 0px rgba(0, 0, 0, 0.1), inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
      },
      secondary: {
        bg: "secondary",
        fontWeight: "body",
        fontSize: "1",
        color: "textClear",
        border: (t) => `1px solid ${t?.colors?.borders}`,
        "&:hover": {
          bg: darken("secondary", 0.02),
          cursor: "pointer",
        },
        "&:focus": {
          bg: darken("secondary", 0.05),
          borderColor: darken("secondary", 0.15),
          outline: "none",
        },
        "&:active": {
          bg: darken("secondary", 0.06),
          outline: "none",
        },
      },
      small: {
        bg: "primary",
        borderRadius: "4px",
        pl: 2,
        pr: 2,
        pb: 1,
        pt: 1,
        fontSize: "12px",
        fontWeight: "body",
      },

      darkSmall: {
        borderRadius: "4px",
        color: "white",
        fontSize: "12px",
        fontWeight: "body",
        bg: "text",
        boxShadow:
          "0px 1px 0px rgba(0, 0, 0, 0.1), inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
        userSelect: "none",
        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
        "&:hover": {
          bg: lighten("text", 0.05),
          cursor: "pointer",
        },
      },
      lightSmall: {
        borderRadius: "4px",
        color: "text",
        fontSize: "12px",
        fontWeight: "body",
        bg: "white",
        boxShadow:
          "0px 1px 0px rgba(0, 0, 0, 0.1), inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
        userSelect: "none",
        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
        "&:hover": {
          bg: darken("white", 0.05),
          cursor: "pointer",
        },
      },
      actionDelete: {
        width: "100%",
        borderRadius: "4px",
        color: "error",
        fontSize: "16px",
        fontWeight: "body",
        bg: "zoneHeader",
        boxShadow:
          "0px 1px 0px rgba(0, 0, 0, 0.1), inset 0px -1px 0px rgba(0, 0, 0, 0.1)",
        userSelect: "none",
        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
        "&:hover": {
          bg: darken("white", 0.05),
          cursor: "pointer",
        },
      },

      disabled: {
        bg: "#D6CEFC",
        fontSize: "1",
        color: "white",
        cursor: "not-allowed",
        borderColor: "transparent",
      },
      disabledSecondary: {
        bg: "#F9F9FA",
        fontSize: "1",
        color: "#C9D0D8",
        cursor: "not-allowed",
        border: "1px solid",
        borderColor: "1px solid rgba(62, 62, 72, 0.15)",
      },
      transparent: {
        background: "transparent",
        border: "none",
        p: 1,
        color: "primary",
        cursor: "pointer",
      },
      selectIcon: {
        "&:hover": {
          cursor: "pointer",
        },
        "&:focus, &:active": {
          outline: "none",
        },
      },
      textButton: {
        border: "none",
        color: "primary",
        background: "transparent",
        p: 1,
        position: "relative",
        top: "1px",
        ml: 1,
        cursor: "pointer",
        "&:hover": {
          background: "rgba(0,0,0,0.06) !important",
          borderRadius: "3px",
        },
      },
      close: {
        color: "icons",
        "&:hover": {
          bg: "rgba(0,0,0,0.08)",
          cursor: "pointer",
        },
        "&:focus": {
          outline: "none",
        },
      },
      icon: {
        "&:hover": {
          bg: "rgba(0,0,0,0.08)",
        },
        "&:focus": {
          outline: "none",
        },
      },
      round: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
      },
    },
    success: {
      done: {
        position: "absolute",
        top: "57px",
        width: "100%",
        p: 2,
        bg: "success",
      },
      error: {
        position: "absolute",
        top: "57px",
        width: "100%",
        p: 2,
        bg: "error",
      },
      warning: {
        position: "absolute",
        top: "57px",
        width: "100%",
        p: 2,
        bg: "warning",
      },
    },
    cards: {
      primary: {
        bg: "gray",
        border: "1px solid",
        borderRadius: 4,
        borderColor: "borders",
      },
      large: {
        py: 2,
        bg: "gray",
        borderRadius: 4,
        boxShadow: "0 0 8px rgba(0, 0, 0, 0.125)",
      },
    },
    forms: {
      disabled: {
        bg: "muted",
        cursor: "not-allowed",
        pointerEvents: "none",
      },
      checkbox: {
        color: "icons",
      },
      radio: {
        color: "borders",
        "&:checked": {
          color: "purple",
        },
      },
      input: {
        fontSize: 1,
        bg: "headSection",
        borderColor: "borders",
        fontFamily: "body",
        "&::placeholder": {
          fontFamily: "body",
          color: "textClear",
        },
        "&:hover": {
          borderColor: darken("borders", 0.07),
        },
        "&:focus, &:active": {
          outline: "none",
          borderColor: "primary",
          boxShadow:
            "0 0 0 3px rgba(81, 99, 186, 0.2), inset 0 1px 2px rgba(102, 113, 123, 0.2)",
        },
      },
      textarea: {
        fontSize: 1,
        resize: "none",
        bg: "headSection",
        fontFamily: "body",
        borderColor: "borders",
        "&::placeholder": {
          fontFamily: "body",
          color: "textClear",
        },
        "&:hover": {
          borderColor: darken("borders", 0.07),
        },
        "&:focus, &:active": {
          outline: "none",
          borderColor: "primary",
          boxShadow:
            "0 0 0 3px rgba(81, 99, 186, 0.2), inset 0 1px 2px rgba(102, 113, 123, 0.2)",
        },
      },
      hint: {
        fontSize: 1,
        color: (t) => t?.colors?.choggleBox,
      },
      label: {
        fontSize: 1,
        primary: {
          mb: 2,
          fontSize: 1,
          fontWeight: "label",
          position: "relative",
          "& > span": {
            mb: 1,
            display: "inline-block",
            fontWeight: "label",
          },
        },
        border: {
          fontSize: 1,
          mb: 1,
          fontWeight: "body",
          pt: "7px",
          pb: "6px",
          px: 1,
          borderRadius: "3px",
          border: (t) => `1px solid ${t?.colors?.borders}`,
        },
      },
    },
    links: {
      hint: {
        fontSize: 1,
        color: (t) => t?.colors?.link,
        margin: "0 4px",
        textDecoration: "none",
        cursor: "pointer",
        display: "inline-block",
      },
      invisible: {
        color: "text",
        textDecoration: "none",
        cursor: "pointer",
      },
      sidebar: {
        fontSize: 1,
        color: "textClear",
        textDecoration: "none",
        cursor: "pointer",
        borderRadius: "6px",
        p: 2,
        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
        "&:hover": {
          color: "text",
          bg: "#E6E6EA",
        },
      },
    },
    styles: {
      navLink: {
        color: "#FFF",
        "&:hover": {
          color: "#FFF",
        },
      },
      deepNavLink: {
        color: "deep1",
      },
      listItem: {
        borderRadius: "3px",
        my: 3,
        listStyleType: "none",
        justifyContent: "space-between",
      },
      Container: {
        p: 3,
        maxWidth: 1024,
      },
      fixedHeader: {
        position: "fixed",
        alignItems: "center",
        justifyContent: "space-between",
        height: "48px",
        width: "100%",
        bg: "background",
        p: 2,
        top: "0",
        left: "0",
      },
      success: {
        position: "absolute",
        width: "100%",
        p: 2,
      },
      disabledBox: {
        position: "absolute",
        zIndex: "1",
        height: "100%",
        width: "100%",
        background: "rgba(0, 0, 0, .1)",
      },
      root: {
        fontFamily: "body",
        lineHeight: "body",
        fontWeight: "body",
      },
      h1: {
        variant: "textStyles.display",
        fontSize: 1,
      },
      h2: {
        variant: "textStyles.heading",
        fontSize: 5,
      },
      h3: {
        variant: "textStyles.heading",
        fontSize: 4,
      },
      h4: {
        variant: "textStyles.heading",
        fontSize: 3,
      },
      h5: {
        variant: "textStyles.heading",
        fontSize: 2,
      },
      h6: {
        variant: "textStyles.heading",
        fontSize: 1,
      },
      ul: {
        p: 0,
        m: 0,
      },
      li: {
        listStyleType: "none",
      },
      hint: {
        display: "block",
        fontStyle: "normal",
        fontWeight: "normal",
      },
      inlineCode: {
        fontFamily: "monospace",
        color: "error",
        bg: "muted",
      },
      table: {
        width: "100%",
        my: 4,
        borderCollapse: "separate",
        borderSpacing: 0,
        "th,td": {
          textAlign: "left",
          py: "4px",
          pr: "4px",
          pl: 0,
          borderColor: "muted",
          borderBottomStyle: "solid",
        },
      },
      th: {
        verticalAlign: "bottom",
        borderBottomWidth: "2px",
      },
      td: {
        verticalAlign: "top",
        borderBottomWidth: "1px",
      },
      hr: {
        border: 0,
        borderBottom: "1px solid",
        borderColor: "code.border",
      },
      img: {
        maxWidth: "100%",
      },
    },
    alerts: {
      primary: {
        color: "background",
        bg: "primary",
      },
      muted: {
        color: "text",
        bg: "muted",
      },
    },
  } as MyTheme);

export default AppTheme;
