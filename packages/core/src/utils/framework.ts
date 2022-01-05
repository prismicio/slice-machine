import { Frameworks, SupportedFrameworks } from "../models/Framework";

export { Frameworks } from "../models/Framework";

export const UnsupportedFrameWorks = Object.values(Frameworks).filter(
  (framework) => SupportedFrameworks.includes(framework) === false
);

export const isUnsupported = (framework: Frameworks): boolean =>
  UnsupportedFrameWorks.includes(framework);

export function isValidFramework(framework: Frameworks): boolean {
  return SupportedFrameworks.includes(framework);
}
