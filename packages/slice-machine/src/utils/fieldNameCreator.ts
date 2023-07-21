export const createFriendlyFieldNameWithId = (fieldId: string): string => {
  const fieldIdWithoutSpecialCharacter = fieldId.replace(
    /[\s\-_]+(\w)/g,
    function (_match: string, p1: string) {
      return p1.toUpperCase();
    }
  );

  return fieldIdWithoutSpecialCharacter
    .replace(
      /^([a-z])|([a-z][A-Z]+)/g,
      function (match: string, p1: string | undefined, p2: string | undefined) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (p2) return `${p2.slice(0, 1)} ${p2.slice(1, p2.length)}`;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (p1) return p1.toUpperCase();
        return match;
      }
    )
    .trim();
};
