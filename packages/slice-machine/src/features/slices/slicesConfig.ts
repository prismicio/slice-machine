type GetBuilderPagePathnameArgs = {
  libraryName: string;
  sliceName: string;
  variationId: string;
};

export const SLICES_CONFIG = {
  getBuilderPagePathname: ({
    libraryName,
    sliceName,
    variationId,
  }: GetBuilderPagePathnameArgs) =>
    `/${libraryName.replace(/\//g, "--")}/${sliceName}/${variationId}`,
};
