const multiQueryTypes = ["repeat", "repeatable", "multi"];

export async function query({ queryType, apiParams, type, client }) {
  const { uid, ...restApiParams } = apiParams;
  const caller =
    multiQueryTypes.indexOf(queryType) !== -1
      ? ["getByUID", [type, uid, restApiParams]]
      : ["getSingle", [type, restApiParams]];

  return await client[caller[0]](...caller[1]);
}
