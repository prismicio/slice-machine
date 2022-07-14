import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";

export default interface LibraryState {
  name: string;
  isLocal: boolean;
  components: ReadonlyArray<ExtendedComponentUI>;
}
