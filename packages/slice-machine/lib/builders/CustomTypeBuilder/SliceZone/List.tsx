import Grid from "@components/Grid";

import { SharedSlice, NonSharedSlice } from "@lib/models/ui/Slice";

import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";

const List = ({ slices }: { slices: ReadonlyArray<SliceZoneSlice> }) => (
  <Grid
    elems={slices}
    defineElementKey={(slice: SliceZoneSlice) => {
      if (slice.type === SlicesTypes.Slice) {
        // NonsharedSlice
        return (slice.payload as NonSharedSliceInSliceZone).key;
      }
      return (slice.payload as ExtendedComponentUI).component.model.name;
    }}
    renderElem={(slice: SliceZoneSlice) => {
      if (slice.type === SlicesTypes.Slice) {
        return NonSharedSlice.render({
          bordered: true,
          displayStatus: true,
          slice: slice.payload as NonSharedSliceInSliceZone,
        });
      }
      return SharedSlice.render({
        bordered: true,
        displayStatus: true,
        slice: (slice.payload as ExtendedComponentUI).component,
      });
    }}
  />
);

export default List;
