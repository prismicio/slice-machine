import React from 'react'
import { PrismicRichText, PrismicLink } from '@prismicio/react'
import { MailIcon, PhoneIcon } from '@heroicons/react/outline'
import * as prismicH from '@prismicio/helpers'

const ContactSectionSplitTwoTone = ({ slice }) => (
  <section>
    <div className="relative bg-white">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50" />
      </div>
      <div className="relative max-w-7xl mx-auto lg:grid lg:grid-cols-5">
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:col-span-2 lg:px-8 lg:py-24 xl:pr-12">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl"><PrismicRichText field={slice.primary.title} /></h2>
            <p className="mt-3 text-lg leading-6 text-gray-500">
              <PrismicRichText field={slice.primary.description} />
            </p>
            <dl className="mt-8 text-base text-gray-500">
              <div>
                <dt className="sr-only">Postal address</dt>
                <dd>
                  <PrismicRichText field={slice.primary.address} />
                </dd>
              </div>
              <div className="mt-6">
                <dt className="sr-only">Phone number</dt>
                <dd className="flex">
                  <PhoneIcon className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                  <span className="ml-3"><span >{ slice.primary.phone }</span></span>
                </dd>
              </div>
              <div className="mt-3">
                <dt className="sr-only">Email</dt>
                <dd className="flex">
                  <MailIcon className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                  <span className="ml-3"><span >{ slice.primary.email }</span></span>
                </dd>
              </div>
              <div className="mt-6">
                {prismicH.asText(slice.primary.careerText)+' '}
                <PrismicLink document={slice.primary.careerLink} className="font-medium text-gray-700 underline">
                  <span >{ slice.primary.CareerLinkText }</span>
                </PrismicLink>
              </div>
            </dl>
          </div>
        </div>
        <div className="bg-white py-16 px-4 sm:px-6 lg:col-span-3 lg:py-24 lg:px-8 xl:pl-12">
          <div className="max-w-lg mx-auto lg:max-w-none">
            <form action="" method="" className="grid grid-cols-1 gap-y-6">
              { slice?.items?.map((item, i) => 
                <div key={ item.field } >
                  <label htmlFor={ item.field } className="sr-only">
                  { item.field }
                  </label>
                  <input
                    type="text"
                    name={ item.field }
                    id={ item.field }
                    autoComplete={ item.field }
                    className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                    placeholder={ item.fieldPlaceholder }
                  />
                </div>)
              }
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span >{ slice.primary.cta }</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default ContactSectionSplitTwoTone