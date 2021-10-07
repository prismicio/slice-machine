import * as hapi from '@hapi/hapi';
import open from 'open';
import ora from 'ora';
import { CONSTS, bold, underline, error } from '../utils'
import { setAuthConfigCookies } from '../filesystem'

export type HandlerData = { email: string; cookies: ReadonlyArray<string> }


const isHandlerData = (data: string | Record<string, unknown>): data is HandlerData => {
  if (typeof data != 'object') return false

  const { email, cookies } = data as Partial<HandlerData>
  return (
     Boolean(email && cookies) &&
     Array.isArray(cookies) &&
     !cookies.some((c: unknown) => typeof c !== 'string')
  )
}

const Routes = {
  authentication: (server: hapi.Server) => (onSuccess: (data: HandlerData) => void, onFail: () => void): hapi.ServerRoute => ({
    method: 'POST',
    path: '/',
    handler: authenticationHandler(server)(onSuccess, onFail),
  }),

  notFound: {
    method: ['GET', 'POST'],
    path: '/{any*}',
    handler: (request: hapi.Request, h: hapi.ResponseToolkit): hapi.ResponseObject => {
      return h.response(`not found: [${request.method}]: ${request.url.toString()}`).code(404)
    },
  },
}

function validatePayload(payload: Buffer | string | Record<string, unknown>): HandlerData | null {
  if (Buffer.isBuffer(payload)) return null
  return isHandlerData(payload) ? payload : null
}

const authenticationHandler =
  (server: hapi.Server) => (onSuccess: (data: HandlerData) => void, onFail: () => void) => {
  return async (request: hapi.Request, h: hapi.ResponseToolkit) => {
    try {
      const data: HandlerData | null = validatePayload(request.payload as Buffer | string | Record<string, unknown>) // type coming from the lib

      if (!data) {
        onFail()
        h.response('Error with cookies').code(400)
        throw new Error('It seems the server didn\'t respond properly, please contact us.')
      }
      onSuccess(data)
      return h.response(data).code(200)
    } finally {
      void server.stop({timeout: 10000})
    }
  }
}

function buildServer(base: string, port: number, host: string): hapi.Server {
  const server = hapi.server({
    port,
    host,
    routes: {
      cors: {
        origin: [base],
        headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
      },
    },
  })
  return server
}

export async function startServerAndOpenBrowser(
  url: string,
  base: string = CONSTS.DEFAULT_BASE,
  port: number = CONSTS.DEFAULT_SERVER_PORT
): Promise<void> {
  const spinner = ora('Waiting for the browser response');

  function onSuccess(data: HandlerData) {
    onFail()
    //spinner.succeed(`Logged in as ${bold(data.email)}`).stop()
    setAuthConfigCookies(base, data.cookies)
  }

  function onFail(): void {
    spinner.fail(`${error('Error!')} We failed to log you into your Prismic account`)
    console.log(`Run ${bold('npx slicemachine init')} again!`)
    process.exit(-1)
  }

  const server = buildServer(base, port, 'localhost')
  server.route([Routes.authentication(server)(onSuccess , onFail), Routes.notFound])

  return server.start()
  .then(() => {
    console.log('\nOpening browser to ' + underline(url))
    spinner.start()
    void open(url)
  })
}