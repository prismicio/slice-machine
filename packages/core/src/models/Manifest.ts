import * as t from "io-ts";
import { FrameworksC } from "./Framework";

export const Manifest = t.intersection([
  t.type({
    apiEndpoint: t.string,
  }),
  t.partial({
    storybook: t.string,
    localSliceCanvasURL: t.string,
    libraries: t.array(t.string),
    framework: FrameworksC,
    chromaticAppId: t.string,
    _latest: t.string,
  }),
]);

export type Manifest = t.TypeOf<typeof Manifest>;
