import SliceList from "../../../../../components/SliceList";

const DefaultList = ({ slices, cardType }) => (
  <SliceList
    cardType={cardType}
    slices={slices}
    CardWrapper={({ children }: { children: any }) => {
      return children;
    }}
  />
);

export default DefaultList;
