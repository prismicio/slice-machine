import React from 'react'
import * as prismicH from '@prismicio/helpers'

const HeaderSectionSimpleCentered = ({ slice }) => (
  <section>
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {prismicH.asText(slice.primary.title)}
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            {prismicH.asText(slice.primary.description)}
          </p>
        </div>
      </div>
    </div>
  </section>
)

export default HeaderSectionSimpleCentered