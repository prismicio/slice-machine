import React from 'react'
import { PrismicRichText } from '@prismicio/react'

const ContentSectionCentered = ({ slice }) => (
  <section className="relative mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
    {
      slice.primary.description ?
      <PrismicRichText field={slice.primary.description} />
      : <p>start by editing this slice from inside Prismic builder!</p>
    }
  </section>
)

export default ContentSectionCentered