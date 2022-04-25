import '../styles/globals.css'

import Link from 'next/link'
import { PrismicProvider } from '@prismicio/react'
import { PrismicPreview } from '@prismicio/next'
import { linkResolver, repositoryName } from '../prismicio'

export default function App({ Component, pageProps }) {
  return (
    <PrismicProvider
      richTextComponents={{
		    list: ({ children, key }) => <ul className="list-disc list-inside" key={key}>{children}</ul>
      }}
      //linkResolver={linkResolver}
      internalLinkComponent={({ href, anchor, children, ...props }) => (
        //adding support for anchors that can be passed to a PrismicLink
        <Link href={href+(anchor ? "#"+anchor : "")}>
          <a {...props}>
            {children}
          </a>
        </Link>
      )}
    >
      <PrismicPreview repositoryName={repositoryName}>
        <Component {...pageProps} />
      </PrismicPreview>
    </PrismicProvider>
  )
}