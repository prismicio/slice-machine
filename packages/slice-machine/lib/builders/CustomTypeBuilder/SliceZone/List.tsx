import { SliceZoneSlice } from "./";
import { SliceType } from "@lib/models/common/CustomType/sliceZone";
import SliceState from "@lib/models/ui/SliceState";

import Grid from "@components/Grid";

import { SharedSlice, NonSharedSlice } from "@lib/models/ui/Slice";

import { NonSharedSliceInSliceZone } from "@lib/models/common/CustomType/sliceZone";

const List = ({ slices }: { slices: ReadonlyArray<SliceZoneSlice> }) => (
  <Grid
    elems={slices}
    defineElementKey={(slice: SliceZoneSlice) => {
      if (slice.type === SliceType.Slice) {
        // NonsharedSlice
        return (slice.payload as NonSharedSliceInSliceZone).key;
      }
      return (slice.payload as SliceState).infos.sliceName;
    }}
    renderElem={(slice: SliceZoneSlice) => {
      if (slice.type === SliceType.Slice) {
        return NonSharedSlice.render({
          bordered: true,
          displayStatus: true,
          slice: slice.payload as NonSharedSliceInSliceZone,
        });
      }
      return SharedSlice.render({
        bordered: true,
        displayStatus: true,
        slice: slice.payload as SliceState,
      });
    }}
  />
);

export default List;
