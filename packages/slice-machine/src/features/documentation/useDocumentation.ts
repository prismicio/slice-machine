import { useRequest } from "@prismicio/editor-support/Suspense";

import { managerClient } from "@src/managerClient";
import {
  Documentation,
  DocumentationReadHookData,
} from "@slicemachine/plugin-kit";

async function getDocumentation(str: string): Promise<Documentation[]> {
  const args = JSON.parse(str) as DocumentationReadHookData;
  const { errors, documentation } = await managerClient.documentation.read({
    kind: args.kind,
    data: args.data,
  });
  if (
    errors.length > 0 ||
    documentation === undefined ||
    documentation.length === 0
  ) {
    throw errors;
  }

  return documentation;
}

export function useDocumentation(args: DocumentationReadHookData) {
  const documentation = useRequest(getDocumentation, [JSON.stringify(args)]);
  return documentation;
}
