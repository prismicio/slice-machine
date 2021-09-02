import React from 'react'
import { RichText } from 'prismic-reactjs'

const {{componentName}} = ({ slice }) => (
  <section>
    <span className="title">
      <RichText render={slice.primary.title}/>
    </span>
    <div>
      Number: {slice.primary.number}
    </div>
    <style jsx>{`
        section {
          max-width: 600px;
          margin: 4em auto;
          text-align: center;
        }
        .title {
          color: #8592e0;
        }
    `}</style>
  </section>
)

export default {{componentName}}