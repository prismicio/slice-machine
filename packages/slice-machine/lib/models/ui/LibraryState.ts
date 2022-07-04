import SliceState from "./SliceState";

export default interface LibraryState {
  name: string;
  isLocal: boolean;
  components: ReadonlyArray<SliceState>;
}
