import React from "react";
import * as Renderers from "./Renderers";

import { SupportedFrameworks } from "../../../../../../consts";

const FrameworkRenderers = {
  [SupportedFrameworks.nuxt]: Renderers.nuxt,
  [SupportedFrameworks.next]: Renderers.next,
  [SupportedFrameworks.vue]: Renderers.vue,
  [SupportedFrameworks.react]: Renderers.react,
  [SupportedFrameworks.svelte]: Renderers.svelte,
  vanillajs: Renderers.vanillajs,
};

const Hint: React.FC<{
  framework: string;
  show: boolean;
  Widgets: any;
  item: any;
  typeName: string;
  renderHintBase: any;
  isRepeatable: boolean;
}> = ({ framework, show, Widgets, ...rest }) => {
  if (FrameworkRenderers[framework]) {
    const Render = FrameworkRenderers[framework];
    return (
      <div style={{ display: show ? "initial" : "none" }}>
        <Render Widgets={Widgets} {...rest} />
      </div>
    );
  }
  console.error(`Framework "${framework}" not supported`);
  return null;
};

export default Hint;
