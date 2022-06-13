import { InitClient } from "./client";

export async function validateRepositoryName(
  client: InitClient,
  name: string
): Promise<boolean> {
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

  return client.domainExist(domain).catch(() => false);
}
