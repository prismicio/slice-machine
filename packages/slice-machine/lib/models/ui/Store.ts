export default interface Store {
  readonly dispatch: ({
    type,
    payload,
  }: {
    type: string;
    payload?: any;
  }) => void;
}
