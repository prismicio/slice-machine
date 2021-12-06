export default interface UserConfig {
  libraries?: readonly string[];
  apiEndpoint: string;
  localSliceCanvasURL?: string;
  storybook: string;
  chromaticAppId: string;
  _latest: string;
}
