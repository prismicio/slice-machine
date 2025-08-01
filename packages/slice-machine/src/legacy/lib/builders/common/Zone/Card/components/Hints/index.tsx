import React from "react";
import useSWR from "swr";

import { Hint as ContentRelationshipHint } from "@/features/builder/fields/contentRelationship/Hint";
import { managerClient } from "@/managerClient";

import CodeBlock, { Item, RenderHintBaseFN } from "./CodeBlock";

interface HintProps {
  show: boolean;
  item: Item;
  renderHintBase: RenderHintBaseFN;
  hintItemName?: string;
}

const RegularHint: React.FC<HintProps> = ({
  show,
  renderHintBase,
  item,
  hintItemName,
}) => {
  const fieldPathString = renderHintBase({ item });

  const snippetCacheKey = [fieldPathString];
  if (item.value.type === "Link") {
    if (item.value.config?.allowText ?? false)
      snippetCacheKey.push("allowText");
    if (item.value.config?.repeat ?? false) snippetCacheKey.push("repeat");
    if (Boolean(item.value.config?.variants)) snippetCacheKey.push("variants");
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useSWR(snippetCacheKey.join("$"), async () => {
    return await managerClient.snippets.readSnippets({
      fieldPath: fieldPathString.split("."),
      model: item.value,
      itemName: hintItemName,
    });
  });

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (error) {
    console.error(error);
  }

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!data || error) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const snippets = data.snippets || [];

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!snippets[0]) {
    return null;
  }

  return (
    <div style={{ display: show ? "initial" : "none" }}>
      <CodeBlock code={snippets[0].code} lang={snippets[0].language} />
    </div>
  );
};

const Hint: React.FC<HintProps> = (props) => {
  const { item } = props;

  if (item.value.type === "Link" && item.value.config?.select === "document") {
    return <ContentRelationshipHint show={props.show} />;
  }

  return <RegularHint {...props} />;
};

export default Hint;
