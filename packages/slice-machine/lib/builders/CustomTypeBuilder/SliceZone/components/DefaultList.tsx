import  SliceList from '../../../../../components/SliceList'

const DefaultList = ({
  slices
}) =>(
  <SliceList
    slices={slices}
    CardWrapper={({ children }: { children: any }) => {
      return children
    }}
  />
)

export default DefaultList
