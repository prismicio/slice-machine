export default () => ({
  "colors": {
    text: "#222222",
    textClear: "#667587",
    background: "#F5F6F9",
    primary: "#5163BA",
    "secondary": "hsl(10, 60%, 50%)",
    "highlight": "hsl(10, 40%, 90%)",
    "purple": "hsl(250, 60%, 30%)",
    muted: "#F8F9FA",
    icons: "#8091A5",
    gray: "#F8F9FA",
    borders: '#C9D0D8',
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
    "label": 500,
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
    color: '#5163BA',
    marginRight: '8px',
    borderRadius: '4px',
    padding: '4px',
    background: '#F7F8F9',
    border: '2px solid #5163BA',
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
      fontWeight: 'body',
      fontSize: 1,
      margin: 0,
      pl: 2
    }
  },
  badges: {
    'circle-right': {
      top: '-8px',
      right: '-8px',
      height: '24px',
      width: '24px',
      display: 'flex',
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%'
    }
  },
  buttons:  {
    primary: {
      color: 'white',
      fontSize: '1',
      fontWeight: 'body',
      bg: '#6577CF',
      border: '1px solid',
      borderColor: '#4759B3',
      '&:hover': {
        bg: 'primary',
        cursor: 'pointer',
      },
      '&:focus': {
        bg: '#4759B4',
        borderColor: '#1E2D77',
        outline: 'none',
      },
      '&:active': {
        boxShadow: 'inset 0 0 0 1px #1E2D77',
        outline: 'none',
      }
    },
    disabled: {
      bg: 'borders',
      fontSize: '1',
      color: 'rgba(1, 1, 1, .6)',
      cursor: 'not-allowed',
      '&:focus': {
        outline: 'none',
      }
    },
    selectIcon: {
      '&:hover': {
        cursor: 'pointer',
      },
      '&:focus, &:active': {
        outline: 'none',
      }
    },
    secondary: {
      background: '#F9FAFB',
      fontWeight: 'body',
      fontSize: '1',
      color: 'textClear',
      border: ({ colors }) => `1px solid ${colors.borders}`,
      '&:hover': {
        bg: '#F5F6F9',
        cursor: 'pointer',
      },
      '&:focus': {
        bg: '#F0F3F5',
        borderColor: '#C9D0D8',
        outline: 'none',
      },
      '&:active': {
        boxShadow: 'inset 0 0 0 1px #8091A5',
        outline: 'none',
      }
    },
    textButton: {
      border: 'none',
      color: 'primary',
      background: 'transparent',
      p: '8px',
      position: 'relative',
      top: '1px',
      ml: 1,
      cursor: 'pointer',
      '&:focus': {
        outline: 'none',
      }
    },
    close: {
      color: 'icons',
      '&:hover': {
        bg: '#F9FAFB',
        border: '1px solid',
        borderColor: '#C9D0D8',
        cursor: 'pointer'
      },
      '&:focus': {
        outline: 'none',
      }
    },
    icon: {
      '&:hover': {
        bg: '#F9FAFB',
        border: '1px solid',
        borderColor: '#C9D0D8',
      },
      '&:focus': {
        outline: 'none',
      }
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
    primary: {
      bg: '#FFF',
      border: '1px solid',
      borderRadius: 4,
      borderColor: 'borders',
    },
    large: {
      py: 2,
      bg: 'gray',
      borderRadius: 4,
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)',
    }
  },
  forms: {
    disabled: {
      bg: 'muted',
      cursor: 'not-allowed',
      pointerEvents: 'none'
    },
    checkbox: {
      color: 'icons'
    },
    input: {
      fontSize: 1,
      borderColor: 'borders',
      '&::placeholder': {
        color: 'icons',
      },
      '&:hover': {
        borderColor: '#A6ACB2',
      },
      '&:focus, &:active': {
        outline: 'none',
        borderColor: '#3B41BD',
        boxShadow: '0 0 0 3px #EBEBFF, inset 0 1px 2px rgba(102, 113, 123, 0.2)',
      }
    },
    label: {
      primary: {
        mb: 1,
        fontSize: 1,
        fontWeight: 'label'
      },
      border: {
        fontSize: 1,
        mb: 1,
        fontWeight: 'body',
        pt: '7px',
        pb: '6px',
        px: 1,
        borderRadius: '3px',
        border: t => `1px solid ${t.colors.borders}`
      }
    }
  },
  styles: {
    spinner: {
      bg: 'primary',
      color: 'primary'
    },
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