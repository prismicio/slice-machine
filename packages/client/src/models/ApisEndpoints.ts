export interface ApisEndpoints {
  Authentication: string;
  Models: string;
  Users: string;
  AclProvider: string;
}

export const ProductionApisEndpoints: ApisEndpoints = {
  Authentication: "https://auth.prismic.io/",
  Models: "https://customtypes.prismic.io/",
  Users: "https://user.internal-prismic.io/",
  AclProvider: "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
};

export const StageApisEndpoints: ApisEndpoints = {
  Authentication: "https://auth.wroom.io/",
  Models: "https://customtypes.wroom.io/",
  Users: "https://user.wroom.io/",
  AclProvider: "https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
};
