type GetBuilderPagePathnameArgs = {
  libraryName: string;
  sliceName: string;
  variationId: string;
};

export const SLICES_CONFIG = {
  getBuilderPagePathname: (args: GetBuilderPagePathnameArgs) =>
    `/slices/${args.libraryName.replaceAll("/", "--")}/${args.sliceName}/${
      args.variationId
    }`,
};
