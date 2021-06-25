const multiQueryTypes = ['repeat', 'repeatable', 'multi']

export async function query({
  queryType,
  apiParams,
  type,
  uid,
  client,
}) {
  const caller = multiQueryTypes.indexOf(queryType) !== -1 ?
    ['getByUID', [type, uid, apiParams]] :
    ['getSingle', [type, apiParams]]

  return await client[caller[0]](...caller[1])
}