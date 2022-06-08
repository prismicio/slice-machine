export type ApiEndpoints = {
  Models: string;
  AclProvider: string;
};

const ProductionApisEndpoints: ApiEndpoints = {
  Models: "https://customtypes.prismic.io/",
  AclProvider: "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
};

const StageApisEndpoints: ApiEndpoints = {
  Models: "https://customtypes.wroom.io/",
  AclProvider: "https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
};

export const getEndpointsFromBase = (base: string): ApiEndpoints => {
  const url = new URL(base);
  if (url.hostname === "wroom.io") return StageApisEndpoints;
  return ProductionApisEndpoints;
};
