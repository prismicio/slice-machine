import React from "react";

export default function Header({ footer = [], }){
    
    return (
      <footer aria-labelledby="footer-heading" className="bg-white">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="grid md:grid-cols-4 gap-8 xl:col-span-2">
                {footer.data.body.map((column,index) => (
                <div className="space-y-16 md:space-y-0 md:gap-8" key={index}>
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">{column.primary.section_title}</h3>
                        <ul role="list" className="mt-6 space-y-6">
                            {column.items.map((item) => (
                            <li key={item.link_label} className="text-sm">
                                <a href={item.link.url} className="text-gray-500 hover:text-gray-600">
                                {item.link_label}
                                </a>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
                ))}
            </div>
            <div className="mt-16 md:mt-16 xl:mt-0">
              <h3 className="text-sm font-medium text-gray-900">{footer.data.newsletter_title ? footer.data.newsletter_title : <span>newsletter_title</span>}</h3>
              <p className="mt-6 text-sm text-gray-500">{footer.data.newsletter_description ? footer.data.newsletter_description : <span>newsletter_description</span>}</p>
              <form className="mt-2 flex sm:max-w-md">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  type="text"
                  autoComplete="email"
                  required
                  className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-indigo-500 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <div className="ml-4 flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {footer.data.newsletter_button}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-200 py-10">
            <p className="text-sm text-gray-500">{footer.data.copyright}</p>
          </div>
        </div>
      </footer>
  )
}