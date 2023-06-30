import type { DocumentationReadHook } from "@slicemachine/plugin-kit";
import type { PluginOptions } from "../types";

const md = `
### Page router

With some descriptive content and bottom padding.

\`\`\`typescript [app/index.tsx]
const a = true;
const b = !a;
\`\`\`

And additional content again.

And additional content again.

And additional content again.

And additional content again.

And additional content again.

And additional content again.

And additional content again.

`;

export const documentationRead: DocumentationReadHook<PluginOptions> = (
	data,
) => {
	if (data.kind === "PageSnippet") {
		return [
			{
				label: "Page router",
				content: md,
			},
			{
				label: "App router",
				content: "# App router",
			},
		];
	}

	return [];
};
