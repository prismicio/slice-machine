import { SliceState } from './SliceState'
import Store from './Store'

export default interface LibraryState {
  name: string
  components: ReadonlyArray<[
    state: SliceState,
    store: Store
  ]>
}