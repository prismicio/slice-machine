export default () => ({
  "colors": {
    text: "hsl(10, 20%, 20%)",
    textClear: "#667586",
    background: "#F5F6F9",
    primary: "#5263BA",
    "secondary": "hsl(10, 60%, 50%)",
    "highlight": "hsl(10, 40%, 90%)",
    "purple": "hsl(250, 60%, 30%)",
    muted: "#F8F9FA",
    icons: "#9ca3a9",
    gray: "#F8F9FA",
    borders: '#DEE1E5',
    deep: '#0E2150',
    deep1: '#A0ADE7',
    error: '#F45A5B',
    success: '#2CB28A'
  },
  "fonts": {
    "body": "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif",
    "heading": "inherit",
    "monospace": "Menlo, monospace"
  },
  "fontSizes": [
    12,
    14,
    16,
    20,
    24,
    32,
    48,
    64,
    72
  ],
  "fontWeights": {
    "body": 400,
    "heading": 500,
    "label": 600,
    "display": 900
  },
  "lineHeights": {
    "body": 1.5,
    "heading": 1.25
  },
  "textStyles": {
    "heading": {
      "fontFamily": "heading",
      "fontWeight": "heading",
      "lineHeight": "heading"
    },
    "display": {
      "variant": "textStyles.heading",
      "fontSize": [
        5,
        6
      ],
      "fontWeight": "display",
      "letterSpacing": "-0.03em",
      "mt": 3
    }
  },
  widgetIcons: {
    color: '#5263BA',
    marginRight: '8px',
    borderRadius: '4px',
    padding: '4px',
    border: '1px solid #DEE1E5',
  },
  sizes: {
    sidebar: 340,
  },
  text: {
    xs: {
      fontWeight: '400',
      color: 'textClear',
      fontSize: 1
    },
    small: {
      fontWeight: '500',
      fontSize: 2
    },
    labelError: {
      color: 'error',
      fontSize: 2,
      margin: 0,
      pl: 2
    }
  },
  buttons:  {
    disabled: {
      bg: 'borders',
      color: 'rgba(1, 1, 1, .6)',
      cursor: 'not-allowed'
    },
    selectIcon: {
      '&:focus, &:active': {
        outline: 'none',
      }
    },
    secondary: {
      background: '#F9FAFB',
      color: 'text',
      border: ({ colors }) => `1px solid ${colors.borders}`
    },
    textButton: {
      border: 'none',
      color: 'primary',
      background: 'transparent',
      p: '8px',
      position: 'relative',
      top: '1px',
      ml: 1,
      cursor: 'pointer'
    }
  },
  success: {
    done: {
      position: 'absolute',
      top: '57px',
      width: '100%',
      p: 2,
      bg: 'success'
    },
    error: {
      position: 'absolute',
      top: '57px',
      width: '100%',
      p: 2,
      bg: 'error'
    }
  },
  cards: {
    large: {
      py: 2,
      bg: 'gray',
      borderRadius: 4,
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)',
    }
  },
  forms: {
    input: {
      borderColor: 'borders',
    },
    label: {
      primary: {
        mb: 1,
        fontWeight: 'label'
      },
      border: {
        mb: 1,
        fontWeight: 'label',
        py: 2,
        px: 1,
        borderRadius: '3px',
        border: t => `1px solid ${t.colors.borders}`
      }
    }
  },
  "styles": {
    navLink: {
      color: '#FFF',
      '&:hover': {
        color: '#FFF'
      }
    },
    deepNavLink: {
      color: 'deep1'
    },
    listItem: {
      bg: '#FFF',
      border: t => `1px solid #DEE1E5`,
      borderRadius: '2px',
      my: 3,
      justifyContent: 'space-between',
      // '&:first-child': {
      //   mt: 4
      // }
    },
    "Container": {
      "p": 3,
      "maxWidth": 1024
    },
    "root": {
      "fontFamily": "body",
      "lineHeight": "body",
      "fontWeight": "body"
    },
    "h1": {
      "variant": "textStyles.display"
    },
    "h2": {
      "variant": "textStyles.heading",
      "fontSize": 5
    },
    "h3": {
      "variant": "textStyles.heading",
      "fontSize": 4
    },
    "h4": {
      "variant": "textStyles.heading",
      "fontSize": 3
    },
    "h5": {
      "variant": "textStyles.heading",
      "fontSize": 2
    },
    "h6": {
      "variant": "textStyles.heading",
      "fontSize": 1
    },
    ul:  {
      p: 0,
      m: 0
    },
    li: {
      listStyle: 'none'
    },
    "pre": {
      "variant": "prism",
      "fontFamily": "monospace",
      "fontSize": 1,
      "p": 3,
      "color": "text",
      "bg": "muted",
      "overflow": "auto",
      "code": {
        "color": "inherit"
      }
    },
    "code": {
      "fontFamily": "monospace",
      "color": "secondary",
      "fontSize": 1
    },
    "inlineCode": {
      "fontFamily": "monospace",
      "color": "secondary",
      "bg": "muted"
    },
    "table": {
      "width": "100%",
      "my": 4,
      "borderCollapse": "separate",
      "borderSpacing": 0,
      "th,td": {
        "textAlign": "left",
        "py": "4px",
        "pr": "4px",
        "pl": 0,
        "borderColor": "muted",
        "borderBottomStyle": "solid"
      }
    },
    "th": {
      "verticalAlign": "bottom",
      "borderBottomWidth": "2px"
    },
    "td": {
      "verticalAlign": "top",
      "borderBottomWidth": "1px"
    },
    "hr": {
      "border": 0,
      "borderBottom": "1px solid",
      "borderColor": "muted"
    },
    "img": {
      "maxWidth": "100%"
    }
  },
  alerts: {
    primary: {
      color: 'background',
      bg: 'primary',
    },
    muted: {
      color: 'text',
      bg: 'muted',
    },
  },
  "prism": {
    ".comment,.prolog,.doctype,.cdata,.punctuation,.operator,.entity,.url": {
      "color": "gray"
    },
    ".comment": {
      "fontStyle": "italic"
    },
    ".property,.tag,.boolean,.number,.constant,.symbol,.deleted,.function,.class-name,.regex,.important,.variable": {
      "color": "purple"
    },
    ".atrule,.attr-value,.keyword": {
      "color": "primary"
    },
    ".selector,.attr-name,.string,.char,.builtin,.inserted": {
      "color": "secondary"
    }
  }
})