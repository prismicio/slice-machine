import { Errors } from 'io-ts'

interface PathType {
  type: 'index' | 'path'
  value: string
}

const Errors = {
  report(errors: Errors): string {
    const invalidPaths = errors
    .map(error => {
      const chunk = error.context.map(({ key }) => key).filter(c => c !== '')
      const computedChunks: PathType[] = chunk.map(c => {
        const index = parseInt(c)
        if(isNaN(index)) {
          return {
            type: 'path',
            value: c
          } as PathType
        } else {
          return {
            type: 'index',
            value: index.toString()
          } as PathType
        }
      })

      const formattedPath = computedChunks.reduce((acc: string, chunk: PathType) => {
        switch(chunk.type) {
          case 'index': return acc + `|${chunk.value}|`
          case 'path': return acc + `/${chunk.value}`
        }
      }, '');

      return [error.value, formattedPath]
    })
    .map(([value, path]) => `\tPATH: ${path}\n\tVALUE: ${JSON.stringify(value)}`)
    .join('\n\n');

  return `
Invalid Paths:
${invalidPaths}
`
  }
}

export default Errors