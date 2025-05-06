export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function pluralize(
  singular: string,
  count: number = 2,
  plural?: string,
) {
  return count === 1 ? singular : plural ?? `${singular}s`;
}
