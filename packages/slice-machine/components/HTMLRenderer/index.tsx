import parse, {
  domToReact,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";

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

        const Comp = components[domNode.name];

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
