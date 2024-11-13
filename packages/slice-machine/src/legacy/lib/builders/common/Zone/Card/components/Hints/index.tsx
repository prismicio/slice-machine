import React from "react";
import useSWR from "swr";

import { managerClient } from "@/managerClient";

import CodeBlock, { Item, RenderHintBaseFN } from "./CodeBlock";

interface HintProps {
  show: boolean;
  item: Item;
  renderHintBase: RenderHintBaseFN;
  hintItemName?: string;
}

const Hint: React.FC<HintProps> = ({
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

export default Hint;
