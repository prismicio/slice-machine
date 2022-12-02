import CodeSpan from "@components/CodeSpan";

type TextWithInlineCodeProps = {
  children: string;
};

const TextWithInlineCode = ({
  children,
}: TextWithInlineCodeProps): JSX.Element => {
  const res = children.split("`").map((part, i) => {
    if (i % 2 === 1) {
      return <CodeSpan>{part}</CodeSpan>;
    } else {
      return part;
    }
  });

  return <>{res}</>;
};

export default TextWithInlineCode;
