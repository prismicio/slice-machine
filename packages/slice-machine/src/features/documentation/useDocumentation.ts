import { useRequest } from "@prismicio/editor-support/Suspense";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import { managerClient } from "@src/managerClient";

type UseDocumentationArgs = {
  kind: "PageSnippet";
  data: { model: CustomType };
};

async function getDocumentation(str: string) {
  const args = JSON.parse(str) as UseDocumentationArgs;
  const { errors, documentation } = await managerClient.documentation.read({
    kind: args.kind,
    data: args.data,
  });
  if (errors.length > 0) {
    throw errors;
  }

  return documentation;
}

export function useDocumentation(args: UseDocumentationArgs) {
  const documentation = useRequest(getDocumentation, [JSON.stringify(args)]);
  return documentation;
}
