declare module 'sm-commons/methods/lib' {
  export function getInfoFromPath(libPath: string, startPath: string): {
    config: any;
    isLocal: boolean;
    pathExists: string;
    pathToLib: string;
    pathToSlices: string;
  };
}
declare module 'sm-commons/utils/str' {
  export function pascalize(str: string): string
  export function slugify(str: string): string
}
