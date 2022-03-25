import React from "react";
import * as Renderers from "./Renderers";

import type { Item, RenderHintBaseFN, WidgetsType } from "./CodeBlock";

import { Frameworks } from "@slicemachine/core/build/models/Framework";

const FrameworkRenderers = {
  [Frameworks.nuxt]: Renderers.nuxt,
  [Frameworks.previousNuxt]: Renderers.previousNuxt,
  [Frameworks.next]: Renderers.next,
  [Frameworks.vue]: Renderers.vue,
  [Frameworks.react]: Renderers.react,
  [Frameworks.svelte]: Renderers.svelte,
  [Frameworks.vanillajs]: Renderers.vanillajs,
  [Frameworks.none]: null,
  [Frameworks.gatsby]: null,
  [Frameworks.previousNext]: Renderers.previousNext,
};

interface HintProps {
  framework: Frameworks;
  show: boolean;
  Widgets: WidgetsType;
  item: Item;
  typeName: string;
  renderHintBase: RenderHintBaseFN;
  isRepeatable: boolean;
}

const Hint: React.FC<HintProps> = ({ framework, show, Widgets, ...rest }) => {
  const Render = FrameworkRenderers[framework];

  if (!Render) {
    console.error(`Framework "${framework}" not supported`);
    return null;
  }

  return (
    <div style={{ display: show ? "initial" : "none" }}>
      <Render Widgets={Widgets} {...rest} />
    </div>
  );
};

export default Hint;
