import {LogDecorations} from './logDecoration'
import * as hapi from '@hapi/hapi'
import open from 'open'

export const DEFAULT_PORT = 5555

type HandlerData = { email: string; cookies: ReadonlyArray<string> }
const isHandlerData = (data: string | Record<string, unknown>): data is HandlerData => {
  if (typeof data != 'object') return false

  const { email, cookies } = data as Partial<HandlerData>
  if (!email || !cookies) return false
  if (!Array.isArray(cookies)) return false

  return (
     Boolean(email && cookies) &&
     Array.isArray(cookies) &&
     cookies.some((c: unknown) => typeof c !== 'string')
  )
}

const Routes = {
  authentication: (server: hapi.Server) => (cb: (data: HandlerData) => Promise<void>): hapi.ServerRoute => ({
    method: 'POST',
    path: '/',
    handler: authenticationHandler(server)(cb),
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

const authenticationHandler = (server: hapi.Server) => (cb: (data: HandlerData) => Promise<void>) => {
  return async (request: hapi.Request, h: hapi.ResponseToolkit) => {
    try {
      const data: HandlerData | null = validatePayload(request.payload as Buffer | string | Record<string, unknown>) // type coming from the lib

      if (!data) {
        h.response('Error with cookies').code(400)
        throw new Error('It seems the server didn\'t respond properly, please contact us.')
      }
      await cb(data)
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

async function startServerAndOpenBrowser(
  url: string,
  base: string,
  port: number,
  logAction: string,
  setCookies: (cookies: ReadonlyArray<string>) => Promise<void>,
):  Promise<void> {
  return new Promise(resolve => {
    async function callback(data: HandlerData) {
      await setCookies(data.cookies)
      console.log(`Logged in as ${data.email}`)
      resolve()
    }

    const server = buildServer(base, port, 'localhost')
    server.route([Routes.authentication(server)(callback), Routes.notFound])

    void server.start()
    .then(() => {
      console.log('\nOpening browser to ' + LogDecorations.Underscore + url + LogDecorations.Reset)
      console.log(logAction, 'Waiting for the browser response')
      void open(url)
    })
  })
}

export const Server = {
  Routes,
  build: buildServer,
  startAndOpenBrowser: startServerAndOpenBrowser
}