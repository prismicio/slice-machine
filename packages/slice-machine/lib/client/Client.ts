export default interface Client<T> {
  get: () => any
  insert: (body: object | string) => Promise<T>
  update: (body: object | string) => Promise<T>
}