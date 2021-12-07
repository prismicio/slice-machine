import React from "react";
import * as Renderers from "./Renderers";
import { Frameworks } from "@slicemachine/core/build/src/models/Framework";

const FrameworkRenderers = {
  [Frameworks.nuxt]: Renderers.nuxt,
  [Frameworks.next]: Renderers.next,
  [Frameworks.vue]: Renderers.vue,
  [Frameworks.react]: Renderers.react,
  [Frameworks.svelte]: Renderers.svelte,
  [Frameworks.vanillajs]: Renderers.vanillajs,
  [Frameworks.none]: null,
  [Frameworks.gatsby]: null,
};

interface HintProps {
  framework: Frameworks;
  show: boolean;
  Widgets: JSX.Element[];
}

const Hint: React.FC<HintProps> = ({ framework, show, Widgets, ...rest }) => {
  const Render = FrameworkRenderers[framework];

  if (!Render) {
    console.error(`Framework "${framework}" not supported`);
    return null;
  }

  return (
    <div style={{ display: show ? "initial" : "none" }}>
      {/* @ts-ignore: Properties missmatch */}
      <Render Widgets={Widgets} {...rest} />
    </div>
  );
};

export default Hint;
