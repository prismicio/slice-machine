const mutate = () => ({
  status: 403,
  fake: true,
  err: 'You are not connected to Prismic'
})

export default function fakeClient() {
  return {
    get() {
      return {
        status: 200,
        fake: true,
        json() {
          return []
        }
      }
    },
    insert: mutate,
    update: mutate,
    getPresignedUrl: mutate
  }
}