import fs from 'fs'
import path from 'path'
import glob from 'glob'
import slash from 'slash'

import hydrate from 'next-mdx-remote/hydrate'
import renderToString from 'next-mdx-remote/render-to-string'
import { changelogPath } from '../lib/consts'

import { Heading } from 'theme-ui'
import Container from '../components/Container'
import Card from '../components/Card/Default'

export default function Changelog({ sources }) {
  return (
    <main>
      <Container sx={{ maxWidth: '840px'}}>
        <Heading as="h2">Change log</Heading>
        {(sources || []).map(({ source, title }) => (
          <Card
            key={title}
            sx={{ border: t => `1px solid ${t.colors.borders}`, mt: 4 }}
            HeaderContent={(<Heading as="h3">v{title}</Heading>)}
          >
            {hydrate(source)}
          </Card>
        ))}
      </Container>
    </main>
  )
}

export const getStaticProps = async () => {
  const paths = glob.sync(`${slash(changelogPath)}/**/index.mdx`)
  const mdxSources = await Promise.all(paths.map(p => {
    return new Promise(async (resolve) => {
      const file = fs.readFileSync(p, 'utf-8')
      const source = await renderToString(file)
      resolve({
        source,
        title: path.dirname(p).split(path.posix.sep).pop()
      })
    })
  }))

  return {
    props: {
      sources: mdxSources.reverse()
    },
  }
}