import React from 'react'
import { PrismicLink } from '@prismicio/react'

const HeroBanner = ({ slice }) => (
  <section>
    <div className="relative bg-gray-800 py-32 px-6 sm:py-40 sm:px-12 lg:px-16">
      <div className="absolute inset-0 overflow-hidden">
        <picture>
        {slice.primary.image.mobile
          ? <source srcSet={slice.primary.image.mobile.url} media="(max-width: 640px)"/>
          : <div/>
        }
          <img
            src={slice.primary.image.url}
            alt={slice.primary.image.alt}
            className="w-full h-full object-center object-cover"
          />
        </picture>
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gray-900 bg-opacity-50" />
      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{ slice.primary.title }</h2>
        <p className="mt-3 text-xl text-white">
            { slice.primary.description }
        </p>
        {
        slice.variation === "default-slice" &&
        <PrismicLink
          document={slice.primary.CTALink}
          className="mt-8 w-full block bg-white border border-transparent rounded-md py-3 px-8 text-base font-medium text-gray-900 hover:bg-gray-100 sm:w-auto"
        >
          { slice.primary.cta }
        </PrismicLink>
        }
      </div>
    </div>
  </section>
)

export default HeroBanner