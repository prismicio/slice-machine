const mutate = () => ({
  status: 403,
  err: 'You are not connected to Prismic'
})

export default function fakeClient() {
  return {
    get() {
      return {
        status: 200,
        json() {
          return []
        }
      }
    },
    insert: mutate,
    update: mutate
  }
}