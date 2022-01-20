export default interface Store {
  readonly dispatch: ({
    type,
    payload,
  }: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  }) => void;
}
