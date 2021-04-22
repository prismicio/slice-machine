import fs from 'fs'
import { Fragment } from 'react-is'
import { ThemeProvider } from 'theme-ui'
import { CallToAction } from "./slices"

const MyData = {
  uid: "my-uid",
  number: 1,
  body: [{
    slice_type: "MySlice"
  }]
}

const HomePage = ({ slices, data, otherProps, ...rest }) => (
  <Fragment>
    <SliceZone slices={slices} />
    <SliceZone slices={slices2} />
  </Fragment>
)

export const getStaticProps = () => {
  const myOtherData = fs.readFileSync('../files/my-file.txt')
  return {
    props: {
      myOtherData,
      otherProps: true
    }
  }
}

export default HomePage
