import { darken, lighten, alpha } from "@theme-ui/color";

import { Theme } from "theme-ui";

const AppTheme = (): Theme =>
  ({
    initialColorModeName: "light",
    colors: {
      text: "#25252D",
      textClear: "#6F6E77",
      grayLight: "#E8E8ED",
      hoverBackground: "#f2f2f2",
      background: "#FFF",
      backgroundClear: "#FFF",
      primary: "#5D40F7",
      purpleLight: "#F6F1FC",
      purpleLight01: "#6548FF1A",
      purple12: "#F1EEFE",
      purpleStrong: "#5842C3",
      whiteButtonText: "#1A1523",
      codeBlockBackground: "#32275F",
      failedConnectText: "#86848D",
      changesWarning: {
        background: "#FFECC7",
        color: "#5C0C17",
      },
      greyIcon: "#6F6E77",
      greyIconDisabled: "#C9D0D8",
      missingScreenshotBanner: {
        color: "#5C0C17",
        bg: "#FFECC7",
      },
      badge: {
        new: {
          bg: "#DBEDDB",
          color: "#05644D",
        },
        modified: {
          bg: "#FFECC7",
          color: "#5C0C17",
        },
        synced: {
          bg: "purple12",
          color: "#5842C3",
        },
        deleted: {
          bg: "rgba(203, 36, 49, 0.1)",
        },
        unknown: {
          bg: "#F3F5F7",
          color: "#9AA4AF",
        },
      },
      codeBlockBorder: "#545454",
      secondary: "#F9FAFB",
      danger: "#CB2431",
      highlight: "hsl(10, 40%, 90%)",
      purple: "#5B3DF5",
      purple08: "#5842C3",
      muted: "#F9F9FB",
      icons: "#8091A5",
      gray: "#F8F9FA",
      grey01: "#F3F5F7",
      grey02: "#E6E6EA",
      grey03: "#F4F2F4",
      grey04: "#9AA4AF",
      grey05: "#667587",
      grey07: "#F9F8F9",
      grey10: "#86848D",
      grey12: "#1A1523",
      greyTransparent: "rgba(37, 37, 45, 0.4)",
      borders: "#E4E2E4",
      bordersFocused: "#6E56CF",
      deep: "#0E2150",
      deep1: "#A0ADE7",
      lightGreen: "#EBF8F1",
      lightOrange: "#FDF4EC",
      darkOrange: "#C17C10",
      error: "#E55737",
      success: "#3AB97A",
      headSection: "#fff",
      warning: "#E67E22",
      warning02: "#ED811C",
      sidebar: "#F1F1F4",
      link: "#6E56CF",
      choggleBox: "#5163BA",
      darkBorder: "#DCDBDD",
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
          grey02: "#E6E6EA",
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
      bold: 600,
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
        fontFamily: "body",
      },
      small: {
        fontWeight: "500",
        fontSize: 2,
        fontFamily: "body",
      },
      labelError: {
        color: "error",
        fontWeight: "body",
        fontSize: 1,
        marginLeft: 2,
        marginBottom: "0!important",
      },
      secondary: {
        color: "greyIcon",
        fontSize: 1,
      },
      pre: {
        fontSize: 1,
        fontWeight: "400",
        color: "textClear",
        bg: "grey01",
        p: "2px",
      },
      heading: {
        fontWeight: "500",
      },
      grey: {
        color: "#4E4E55",
      },
    },
    badges: {
      SYNCED: {
        fontWeight: "body",
        color: "badge.synced.color",
        bg: "badge.synced.bg",
        px: 1,
        py: "1px",
      },
      NEW: {
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
      DELETED: {
        fontWeight: "body",
        color: "danger",
        bg: "badge.deleted.bg",
        px: 1,
        py: "1px",
      },
      UNKNOWN: {
        fontWeight: "body",
        color: "badge.unknown.color",
        bg: "badge.unknown.bg",
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
    boxes: {
      centered: {
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      },
    },
    buttons: {
      primary: {
        color: "white",
        fontSize: 1,
        fontFamily: "body",
        fontWeight: "body",
        lineHeight: "24px",
        padding: "7px 15px",
        borderRadius: "4px",
        userSelect: "none",

        bg: alpha("primary", 0.9),
        borderColor: "primary",
        borderStyle: "solid",
        borderWidth: "1px",

        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",

        "&:hover": {
          cursor: "pointer",
          bg: "primary",
        },

        "&:focus": {
          boxShadow: "0px 0px 0px 1px var(--theme-ui-colors-primary)", // little hack
          borderColor: "white",
          bg: "primary",
          outline: "none",
        },

        "&:disabled": {
          cursor: "not-allowed",
          bg: alpha("primary", 0.5),
          borderColor: "transparent",
        },
      },

      screenSize: {
        p: 0,
        fontFamily: "body",
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
        fontFamily: "body",
        fontWeight: "body",
        fontSize: "1",
        color: "textClear",
        border: (t) => `1px solid ${String(t?.colors?.borders)}`,
        "&:hover:enabled": {
          bg: darken("secondary", 0.02),
          cursor: "pointer",
        },
        "&:focus:enabled": {
          bg: darken("secondary", 0.05),
          borderColor: darken("secondary", 0.15),
          outline: "none",
        },
        "&:active:enabled": {
          bg: darken("secondary", 0.06),
          outline: "none",
        },
      },
      danger: {
        bg: "danger",
        fontFamily: "body",
        fontWeight: "bold",
        fontSize: "1",
        color: "purple12",
        px: "16px",
        py: "8px",
        borderRadius: "6px",
        border: `1px solid #C61926`,
        "&:hover": {
          bg: darken("danger", 0.05),
          cursor: "pointer",
        },
        "&:focus": {
          bg: darken("danger", 0.05),
          borderColor: darken("danger", 0.15),
          outline: "none",
        },
        "&:active": {
          bg: darken("danger", 0.06),
          outline: "none",
        },
      },
      dropDownButton: {
        fontSize: "1",
        p: "3px",
        pl: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "6px",
        border: "1px solid #DCDBDD",
        fontWeight: "bold",
        bg: "secondary",
        fontFamily: "body",
        color: "textClear",
        "&:hover": {
          "&:not([disabled])": {
            bg: darken("secondary", 0.02),
            cursor: "pointer",
          },
        },
        "&:focus": {
          bg: darken("secondary", 0.05),
          borderColor: darken("secondary", 0.15),
          outline: "none",
          boxShadow: "inset 0px 2px 0px rgba(0, 0, 0, 0.08);",
        },
        "&:active": {
          "&:not([disabled])": {
            bg: darken("secondary", 0.06),
            outline: "none",
          },
        },
        "&:disabled": {
          cursor: "not-allowed",
          color: alpha("textClear", 0.6),
        },
        "&>svg": {
          pointerEvents: "none",
        },
      },
      small: {
        bg: "primary",
        borderRadius: "4px",
        pl: 2,
        pr: 2,
        pb: 1,
        pt: 1,
        fontFamily: "body",
        fontSize: "12px",
        fontWeight: "body",
      },
      secondarySmall: {
        background: "#FFFFFF",
        border: "1px solid #DCDBDD",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
        borderRadius: "6px",
        color: "#1A1523",
        fontFamily: "body",
        fontSize: "12px",
        lineHeight: "16px",
        pl: 2,
        pr: 2,
        py: "5px",
        cursor: "pointer",
        "&:hover:enabled": {
          background: "#F4F2F4",
        },
        "&:active:enabled": {
          background: "#F4F2F4",
          boxShadow: "inset 0px 2px 0px rgba(0, 0, 0, 0.08)",
        },
        "&:disabled": {
          cursor: "not-allowed",
          opacity: 0.5,
        },
      },
      secondaryMedium: {
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "bold",
        fontFamily: "body",
        lineHeight: "24px",
        letterSpacing: "-0.15px",
        color: "whiteButtonText",
        border: "1px solid #DCDBDD",
        backgroundColor: "white",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
        cursor: "pointer",
        "&:focus": {
          boxShadow: "0px 0px 0px 3px rgba(124, 102, 220, 0.3)",
          border: "1px solid #6E56CF",
        },
        "&:hover": {
          "&:not([disabled])": {
            backgroundColor: "#F4F2F4",
            cursor: "pointer",
          },
        },
        "&:active": {
          "&:not([disabled])": {
            backgroundColor: "#F4F2F4",
            boxShadow: "inset 0px 2px 0px rgba(0, 0, 0, 0.08)",
          },
        },
        "&:disabled": {
          color: "#908E96",
          cursor: "not-allowed",
        },
      },
      darkSmall: {
        borderRadius: "4px",
        color: "white",
        fontFamily: "body",
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
        fontFamily: "body",
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
        fontFamily: "body",
        fontWeight: "body",
        bg: "grey02",
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
        fontFamily: "body",
        cursor: "not-allowed",
        borderColor: "transparent",
      },
      disabledSecondary: {
        bg: "#F9F9FA",
        fontSize: "1",
        color: "#C9D0D8",
        fontFamily: "body",
        cursor: "not-allowed",
        border: "1px solid",
        borderColor: "1px solid rgba(62, 62, 72, 0.15)",
      },
      transparent: {
        background: "transparent",
        border: "none",
        fontFamily: "body",
        p: 1,
        color: "primary",
        cursor: "pointer",
      },
      selectIcon: {
        fontFamily: "body",
        "&:hover": {
          cursor: "pointer",
        },
        "&:focus, &:active": {
          outline: "none",
        },
      },
      textButton: {
        fontFamily: "body",
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
        fontFamily: "body",
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
        fontFamily: "body",
        "&:hover": {
          bg: "rgba(0,0,0,0.08)",
        },
        "&:focus": {
          outline: "none",
        },
      },
      round: {
        fontFamily: "body",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
      },
      white: {
        bg: "#FFF",
        color: "#1A1523",
        border: "1px solid #DCDBDD",
        boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
        borderRadius: "6px",
        fontFamily: "body",
        fontWeight: "600",
        fontSize: 1,
        px: 3,
        cursor: "pointer",
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
      drawerCard: {
        backgroundColor: "white",
        boxShadow: "0px 2px 1px rgba(0, 0, 0, 0.05)",
        borderRadius: 6,
        border: (t) => `1px solid ${String(t.colors?.borders)}`,
        px: 16,
        py: 2,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
        dark: {
          color: "#161618",
          cursor: "pointer",
        },
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
          border: (t) => `1px solid ${String(t?.colors?.borders)}`,
        },
        large: {
          fontSize: 1,
          color: "grey12",
        },
      },
      switch: {
        height: "24px",
        width: "45px",
        bg: "#EDECEE",
        "input:checked ~ &": {
          bg: "#6E56CF",
        },
        "input ~ & > div": {
          height: "20px",
          width: "20px",
          border: "1px solid #DCDBDD",
          padding: "2px",
          boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
        },
        "input:checked ~ & > div": {
          height: "20px",
          width: "20px",
          border: "1px solid #5842C3",
          padding: "2px",
          boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.04)",
        },
        "input:checked ~ &:hover": {
          bg: "#5842C3",
        },
        "input:checked ~ & > div:focus": {
          boxShadow: "0px 0px 0px 3px rgba(124, 102, 220, 0.3)",
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
      default: {
        color: "link",
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
          bg: "grey02",
        },
      },
      sidebarEmphasis: {
        fontSize: 1,
        color: "purple",
        textDecoration: "none",
        cursor: "pointer",
        borderRadius: "6px",
        p: 2,
        transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
        "&:hover": {
          bg: "grey02",
        },
      },
      cardSmall: {
        color: "purple08",
        fontSize: "12px",
        textDecoration: "none",
        "&:hover": {
          textDecoration: "underline",
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
        color: "#6E56CF",
        bg: "#F1EEFE",
      },
      // "data-legacy-component" prevent conflict between old and new table
      ["table[data-legacy-component]"]: {
        width: "100%",
        borderCollapse: "collapse",
        borderSpacing: 0,
        "td, th": {
          textAlign: "left",
          borderColor: "muted",
          borderBottomStyle: "solid",
        },
        td: {
          p: "24px",
        },
        "thead tr": {
          bg: "grey02",
          borderRadius: "4px",
          th: {
            p: "12px 24px",
          },
          "th:first-of-type": {
            borderBottomLeftRadius: "4px",
            borderTopLeftRadius: "4px",
          },
          "th:last-of-type": {
            borderBottomRightRadius: "4px",
            borderTopRightRadius: "4px",
          },
        },
        "thead tr.transparent": {
          bg: "transparent",
          color: "greyTransparent",
        },
        "thead tr.small": {
          fontSize: "12px",
        },
        "tbody tr:not(.disabled)": {
          cursor: "pointer",
          transition: "all 150ms cubic-bezier(0.215,0.60,0.355,1)",
          "&:hover": {
            bg: "grey01",
          },
        },
        "tbody tr.disabled": {
          cursor: "not-allowed",
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
  } as Theme);

export default AppTheme;
