import fetch, { Response } from "node-fetch";
import { cookie } from '../utils'

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
  base = "https://prismic.io"
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
): Promise<Response> {
  const token = cookie.parse(cookies)["prismic-auth"] || "";
  const url = toAuthUrl("refreshtoken", token, base);
  return fetch(url);
}

export async function validateSession(
  cookies: string,
  base?: string
): Promise<Response> {
  const token = cookie.parse(cookies)["prismic-auth"] || "";
  const url = toAuthUrl("validate", token, base);
  return fetch(url);
}

/* export async function validateAndRefresh(cookie: string, base?: string) {
  return validateSession(cookie, base).then(() => refreshSession(cookie, base))
} */

export async function validateRepositoryName(
  name?: string,
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

  const url = `/app/dashboard/repositories/${domain}/exists`;

  return fetch(url)
    .then((res) => res.json())
    .then((res) => {
      if (!res && !existingRepo) throw new Error(`${domain} is already in use`);
      return domain;
    });
}

// async function createRepository
// async function createRepositoryWithCookie
// async function createRepositoryWithToken
// async function signUp
