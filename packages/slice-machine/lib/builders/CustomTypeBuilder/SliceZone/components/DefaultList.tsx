import SliceList from "../../../../../components/SliceList";
import SliceState from "../../../../models/ui/SliceState";

const DefaultList = ({ slices, cardType }:  { slices: ReadonlyArray<SliceState>, cardType: string }) => (
  <SliceList
    cardType={cardType}
    slices={slices}
    CardWrapper={({ children }: { children: any }) => {
      return children;
    }}
  />
);

export default DefaultList;
