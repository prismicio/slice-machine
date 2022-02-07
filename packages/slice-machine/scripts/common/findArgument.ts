export function findArgument(
  args: string[],
  name: string
): {
  exists: boolean;
  value?: string;
} {
  const flagIndex: number = args.indexOf(`--${name}`);

  if (flagIndex === -1) return { exists: false };
  if (args.length < flagIndex + 2) return { exists: true };

  const flagValue = args[flagIndex + 1];

  if (flagValue.startsWith("--")) return { exists: true };
  return { exists: true, value: flagValue };
}
