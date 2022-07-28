import { addTrailingSlash } from "utils/str";

export interface ApisEndpoints {
  Wroom: string;
  Authentication: string;
  Models: string;
  Users: string;
  AclProvider: string;
}

export const ProductionApisEndpoints: ApisEndpoints = {
  Wroom: "https://prismic.io/",
  Authentication: "https://auth.prismic.io/",
  Models: "https://customtypes.prismic.io/",
  Users: "https://user.internal-prismic.io/",
  AclProvider: "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
};

export const StageApisEndpoints: ApisEndpoints = {
  Wroom: "https://wroom.io/",
  Authentication: "https://auth.wroom.io/",
  Models: "https://customtypes.wroom.io/",
  Users: "https://user.wroom.io/",
  AclProvider: "https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
};

export const DevApisEndpoints = (): ApisEndpoints => {
  const authenticationApi: string | undefined =
    process.env.authentication_server_endpoint;
  const modelsApi: string | undefined = process.env.customtypesapi_endpoint;
  const usersApi: string | undefined = process.env.user_service_endpoint;
  const aclApi: string | undefined = process.env.acl_provider_endpoint;

  if (!authenticationApi || !modelsApi || !usersApi || !aclApi) {
    // providing relevant instructions
    console.error(`
      It seems you're trying to use Slice Machine in DEV mode without all the environment variables
      Here are the required environment variables
      - Authentication API: ${authenticationApi ? "👍" : "⛔️"}
      - Custom Type API: ${modelsApi ? "👍" : "⛔️"}
      - Users API: ${usersApi ? "👍" : "⛔️"}
      - Acl Provider API: ${aclApi ? "👍" : "⛔️"}
    `);
    // Stopping slice machine
    process.exit(0);
  }

  return {
    Wroom: "http://wroom.test/",
    Authentication: addTrailingSlash(authenticationApi),
    Models: addTrailingSlash(modelsApi),
    Users: addTrailingSlash(usersApi),
    AclProvider: addTrailingSlash(aclApi),
  };
};
