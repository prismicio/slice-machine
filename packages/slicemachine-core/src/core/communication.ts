import axios, { AxiosResponse } from "axios";
import { cookie, CONSTS } from "../utils";

const { DEFAULT_BASE } = CONSTS;

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
  const token = cookie.parse(cookies)["prismic-auth"] || "";
  const url = toAuthUrl("refreshtoken", token, base);
  return axios.get<string>(url).then((res) => res.data);
}

export type Roles = "Writer" | "Owner" | "Publisher" | "Admin"; // other roles ?
export type RepoData = Record<string, { role: Roles; dbid: string }>;
export type UserInfo = { email: string; type: string; repositories: RepoData };

function maybeParseRepoData(repos?: string | RepoData): RepoData {
  if(!repos) return {}
  if(typeof repos === 'string') return JSON.parse(repos) as RepoData
  return repos
}

export async function validateSession(
  cookies: string,
  base?: string
): Promise<UserInfo> {
  const token = cookie.parse(cookies)["prismic-auth"] || "";
  const url = toAuthUrl("validate", token, base);
  return axios
    .get<{ email: string; type: string; repositories?: string }>(url)
    .then((res) => {
      const repositories = maybeParseRepoData(res.data.repositories)
      return {
        ...res.data,
        repositories,
      };
    });
}

/* export async function validateAndRefresh(cookie: string, base?: string) {
  return validateSession(cookie, base).then(() => refreshSession(cookie, base))
} */

export async function listRepositories(
  token: string,
  base = DEFAULT_BASE
): Promise<string[]> {
  return validateSession(token, base).then((data) => {
    return Object.keys(data.repositories).reverse();
  });
}

export async function validateRepositoryName(
  name?: string,
  base = DEFAULT_BASE,
  existingRepo = false
): Promise<string> {
  if (!name) return Promise.reject(new Error("repository name is required"));

  const domain = name.toLocaleLowerCase().trim();

  const errors = [];

  const startsWithLetter = /^[a-z]/.test(domain);
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

export async function createRepository(
  domain: string,
  cookies: string,
  framework = '',
  base = DEFAULT_BASE
  ): Promise<AxiosResponse<{domain:string}>> {
  const data = {
    domain,
    framework,
    plan: 'personal',
    isAnnual: 'false',
    role: 'developer',
  }

  const address = new URL(base)
  address.pathname = '/authentication/newrepository'
  address.searchParams.append('app', 'slicemachine')

  return axios.post<{
    domain: string;
    framework: string;
    plan: string;
    isAnnual: string;
    role: string;
  }, AxiosResponse<{domain: string}>>(address.toString(), data, {
    headers: {
      Cookie: cookies,
      'User-Agent': "prismic-cli/sm"
    },
  })
}
