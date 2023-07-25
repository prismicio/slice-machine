import React from "react";
import useSWR from "swr";
import { managerClient } from "@src/managerClient";

import CodeBlock, { Item, RenderHintBaseFN } from "./CodeBlock";

interface HintProps {
  show: boolean;
  item: Item;
  renderHintBase: RenderHintBaseFN;
}

const Hint: React.FC<HintProps> = ({ show, renderHintBase, item }) => {
  const fieldPathString = renderHintBase({ item });

  // TODO: Call `swr`'s global `mutate` function when something changes to clear the cache.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error } = useSWR(fieldPathString, async () => {
    return await managerClient.snippets.readSnippets({
      fieldPath: fieldPathString.split("."),
      model: item.value,
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
