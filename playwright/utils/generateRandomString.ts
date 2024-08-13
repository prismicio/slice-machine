export function generateRandomString({ length }: { length: number }): string {
  let randomString = "";
  while (randomString.length < length) {
    randomString += Math.random().toString(36).substring(2);
  }
  return randomString.substring(0, length);
}
