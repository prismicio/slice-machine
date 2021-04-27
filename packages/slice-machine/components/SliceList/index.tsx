import { Link } from 'theme-ui'
import Card from './Card'

import SliceState from '../../lib/models/ui/SliceState'
import * as Links from '../../lib/builder/links'
import Grid from '../Grid'

// const DefaultRenderWrapper = (_, children) => <Fragment>{children}</Fragment>

const DefaultCardWrapper = ({
  link,
  children
}: {
  link: { as: string },
  children: any
}) => {
  return (
    <Link
      sx={{
        textDecoration: 'none',
        color: 'inherit'
      }}
      as="a"
      href={link.as}
    >
      { children }
    </Link>
  )
}

const SliceList =  ({
  slices,
  cardProps,
  gridProps,
  CardWrapper = DefaultCardWrapper,
}: {
  slices: ReadonlyArray<SliceState>,
  cardProps?: object,
  gridProps?: object,
  CardWrapper?: Function
}) => (
  <Grid
    {...gridProps}
    elems={slices}
    renderElem={(slice: SliceState) => {
      const defaultVariation = SliceState.variation(slice)
        if (!defaultVariation) {
          return null
        }
        const variationId = defaultVariation.id
        const link = Links.variation(slice.href, slice.jsonModel.name, variationId)
        return (
          <CardWrapper
            slice={slice}
            variationId={variationId}
            link={link}
            key={`${slice.from}-${slice.jsonModel.id}-${variationId}`}
          >
            <Card slice={slice} {...cardProps} defaultVariation={defaultVariation} />
          </CardWrapper>
        )              
      }
    }
  
  />
)

export default SliceList
