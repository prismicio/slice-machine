import React from 'react'
import { PrismicLink } from '@prismicio/react'
import * as prismicH from '@prismicio/helpers'

const ProductListWithCta = ({ slice }) => (
  <section>
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{prismicH.asText(slice.primary.title)}</h2>
          <PrismicLink document={slice.primary.link} className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block">
            {prismicH.asText(slice.primary.description)}<span aria-hidden="true"> &rarr;</span>
          </PrismicLink>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
          {slice.items.map((product) => (
          product.topProduct ?
            <div key={product.topProduct.id} className="group relative">
              <div className="w-full h-56 bg-gray-200 rounded-md overflow-hidden group-hover:opacity-75 lg:h-72 xl:h-80">
                <img
                  src={product.topProduct.imageSrc}
                  alt={product.topProduct.imageAlt}
                  className="w-full h-full object-center object-cover"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">
                <a href={product.productLink.url}>
                  <span className="absolute inset-0" />
                  {product.topProduct.name}
                </a>
              </h3>
              <p className="mt-1 text-sm text-gray-500">{product.topProduct.color}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{product.topProduct.price}</p>
            </div>
          : <p> No Integration Field set up </p>
          ))}
        </div>

        <div className="mt-8 text-sm md:hidden">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Shop the collection<span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  </section>
)

export default ProductListWithCta