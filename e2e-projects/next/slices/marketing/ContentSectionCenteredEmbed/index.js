import React from 'react'

const ContentSectionCenteredEmbed = ({ slice }) => (
  <section>
    <div className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
      {slice.primary.EmbedItem.embed_url &&
      <iframe className="w-full h-80 md:h-96" src={slice.primary.EmbedItem.embed_url.replace("watch\?v=","embed/").replace("vimeo\.com","player\.vimeo\.com\/video")} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      }
      </div>
  </section>
)

export default ContentSectionCenteredEmbed