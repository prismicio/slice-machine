import { Box } from "theme-ui";
import parse, {
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";

import CodeSpan from "@components/CodeSpan";

const defaultComponents: NonNullable<HTMLRendererProps["components"]> = {
  code: ({ children }) => {
    return <CodeSpan>{children}</CodeSpan>;
  },
  pre: ({ children, ...props }) => {
    return (
      <Box
        as="pre"
        {...props}
        sx={{
          backgroundColor: "#161b22",
          color: "#c9d1d9",
          borderRadius: 8,
          padding: "16px 20px",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    );
  },
};

type HTMLRendererProps = {
  html: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, React.ComponentType<any>>;
};

const HTMLRenderer = ({
  html,
  components = {},
}: HTMLRendererProps): JSX.Element => {
  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        const children = domToReact(domNode.children, parserOptions);

        const resolvedComponents = { ...components, ...defaultComponents };
        const Comp = resolvedComponents[domNode.name];

        if (Comp) {
          return (
            <Comp name={domNode.name} {...domNode.attribs}>
              {children}
            </Comp>
          );
        }
      }
    },
  };

  return <>{parse(html, parserOptions)}</>;
};

export default HTMLRenderer;
