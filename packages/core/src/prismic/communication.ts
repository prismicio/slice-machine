import * as t from "io-ts";
import { pipe } from "fp-ts/function";
import { fold, getOrElseW } from "fp-ts/Either";
import axios, { AxiosError, AxiosResponse } from "axios";

import { Roles, RolesValidator } from "./roles";
import { parsePrismicAuthToken } from "../prismic/cookie";
import { DEFAULT_BASE, USER_SERVICE_BASE } from "../defaults";

export type { AxiosError } from "axios";
import { Frameworks, Repositories } from "../models";

/**
 *
 * @param path {string} {path = (validate|refreshtoken)} path to call
 * @param token {string} cookie
 * @param base {string} [base = https://prismic.io]
 * @returns url to vaildate or refresh the current cookie
 */

function toAuthUrl(
  path: "validate" | "refreshtoken",
  token: string,
  base = DEFAULT_BASE
) {
  const url = new URL(base);
  url.hostname = `auth.${url.hostname}`;
  url.pathname = path;
  url.searchParams.set("token", token);
  return url.toString();
}

export async function refreshSession(
  cookies: string,
  base?: string
): Promise<string> {
  const token = parsePrismicAuthToken(cookies);
  const url = toAuthUrl("refreshtoken", token, base);
  return axios.get<string>(url).then((res) => res.data);
}

export type RepoData = Record<
  string,
  { role: Roles | Record<string, Roles>; dbid: string }
>;
const RepoDataValidator = t.record(
  t.string,
  t.type({
    role: RolesValidator,
    dbid: t.string,
  })
);
export type UserInfo = {
  userId: string;
  email: string;
  type: string;
  repositories: RepoData;
};

export function maybeParseRepoData(repos?: string | RepoData): RepoData {
  if (!repos) throw new Error("Did not receive repository data");
  if (typeof repos === "string") {
    return pipe(
      RepoDataValidator.decode(JSON.parse(repos)),
      fold<t.Errors, RepoData, RepoData>(
        () => {
          throw new Error("Can't parse repo data");
        },
        (f: RepoData) => {
          return f;
        }
      )
    );
  }
  return repos;
}

export async function validateCookieSession(
  cookies: string,
  base?: string
): Promise<UserInfo> {
  const token = parsePrismicAuthToken(cookies);
  const url = toAuthUrl("validate", token, base);
  return axios
    .get<{
      userId: string;
      email: string;
      type: string;
      repositories?: string;
    }>(url)
    .then((res) => {
      const repositories = maybeParseRepoData(res.data.repositories);
      return {
        ...res.data,
        repositories,
      };
    });
}

export async function listRepositories(token: string): Promise<Repositories> {
  return axios
    .get<Repositories>(`${USER_SERVICE_BASE}/repositories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      return getOrElseW(() => {
        console.error("Unable to parse user repositories.");
        return [];
      })(Repositories.decode(res.data));
    });
}

export async function validateRepositoryName(
  name?: string,
  base = DEFAULT_BASE,
  existingRepo = false
): Promise<string> {
  if (!name) return Promise.reject(new Error("repository name is required"));

  const domain = name.trim();

  const errors = [];

  const startsWithLetter = /^[a-zA-Z]/.test(domain);
  if (!startsWithLetter) errors.push("Must start with a letter.");

  const acceptedChars = /^[a-z0-9-]+$/.test(domain);
  if (!acceptedChars)
    errors.push("Must contain only lowercase letters, numbers and hyphens.");

  const fourCharactersOrMore = domain.length >= 4;
  if (!fourCharactersOrMore)
    errors.push(
      "Must have four or more alphanumeric characters and/or hyphens."
    );

  const endsWithALetterOrNumber = /[a-z0-9]$/.test(domain);
  if (!endsWithALetterOrNumber)
    errors.push("Must end in a letter or a number.");

  const thirtyCharacterOrLess = domain.length <= 30;
  if (!thirtyCharacterOrLess) errors.push("Must be 30 characters or less");

  if (errors.length > 0) {
    const errorString = errors.map((d, i) => `(${i + 1}: ${d}`).join(" ");
    const msg = `Validation errors: ${errorString}`;
    return Promise.reject(new Error(msg));
  }

  const addr = new URL(base);
  addr.pathname = `/app/dashboard/repositories/${domain}/exists`;
  const url = addr.toString();

  return axios
    .get<boolean>(url)
    .then((res) => res.data)
    .then((res) => {
      if (!res && !existingRepo) throw new Error(`${domain} is already in use`);
      if (res && existingRepo) throw new Error(`${domain} does not exist`);
      return domain;
    });
}

export type CreateRepositoryResponse = Promise<
  AxiosResponse<{ domain: string }>
>;

export async function createRepository(
  domain: string,
  cookies: string,
  framework = Frameworks.vanillajs,
  base = DEFAULT_BASE
): CreateRepositoryResponse {
  const data = {
    domain,
    framework,
    plan: "personal",
    isAnnual: "false",
    role: "developer",
  };

  const address = new URL(base);
  address.pathname = "/authentication/newrepository";
  address.searchParams.append("app", "slicemachine");

  return axios
    .post<
      {
        domain: string;
        framework: string;
        plan: string;
        isAnnual: string;
        role: string;
      },
      AxiosResponse<{ domain: string }>
    >(address.toString(), data, {
      headers: {
        Cookie: cookies,
        "User-Agent": "prismic-cli/sm",
      },
    })
    .catch((error: AxiosError | Error) => {
      if (axios.isAxiosError(error) && error.response) {
        const message = `[${error.response.status}]: ${error.response.statusText}`;
        throw new Error(message);
      }
      throw error;
    });
}
