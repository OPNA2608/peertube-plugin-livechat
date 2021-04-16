import type { Router, RequestHandler, Request, Response, NextFunction } from 'express'
import type { ProxyOptions } from 'express-http-proxy'
import { getBaseRouter } from '../helpers'
import * as path from 'path'
import * as bodyParser from 'body-parser'

const fs = require('fs').promises
const proxy = require('express-http-proxy')

let httpBindRoute: RequestHandler

async function initWebchatRouter (options: RegisterServerOptions): Promise<Router> {
  const {
    getRouter,
    peertubeHelpers,
    settingsManager
  } = options

  const converseJSIndex = await fs.readFile(path.resolve(__dirname, '../../conversejs/index.html'))

  const router: Router = getRouter()
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await settingsManager.getSettings([
        'chat-use-prosody', 'chat-use-builtin', 'chat-room', 'chat-server',
        'chat-bosh-uri', 'chat-ws-uri'
      ])

      let server: string
      let room: string
      let boshUri: string
      let wsUri: string
      if (settings['chat-use-prosody']) {
        server = 'localhost'
        room = '{{VIDEO_UUID}}@room.localhost'
        boshUri = getBaseRouter() + 'webchat/http-bind'
        wsUri = ''
      } else if (settings['chat-use-builtin']) {
        if (!settings['chat-server']) {
          throw new Error('Missing chat-server settings.')
        }
        if (!settings['chat-room']) {
          throw new Error('Missing chat-room settings.')
        }
        if (!settings['chat-bosh-uri'] && !settings['chat-ws-uri']) {
          throw new Error('Missing BOSH or Websocket uri.')
        }
        server = settings['chat-server'] as string
        room = settings['chat-room'] as string
        boshUri = settings['chat-bosh-uri'] as string
        wsUri = settings['chat-ws-uri'] as string
      } else {
        throw new Error('Builtin chat disabled.')
      }

      // FIXME: with Peertube 3.0.1 the following method is not available...
      // When loadByIdOrUUID is available, change the entry point to
      // be /webchat/:videoId
      // const id = req.param('videoId')
      // const video = await peertubeHelpers.videos.loadByIdOrUUID(id)
      let url: string = req.query.url as string || ''
      if (!url) {
        throw new Error('Missing url parameter)')
      }
      let video = await peertubeHelpers.videos.loadByUrl(url)
      if (!video) {
        // FIXME: remove this when loadByIdOrUUID will be available...
        // This is a dirty Hack for dev environnements...
        url = url.replace(/^https:/, 'http:')
        video = await peertubeHelpers.videos.loadByUrl(url)
      }
      if (!video) {
        throw new Error('Video not found')
      }

      let page = '' + (converseJSIndex as string)
      // FIXME: Peertube should provide the static folder path. For now:
      const staticRelative = '../static'
      page = page.replace(/{{BASE_STATIC_URL}}/g, staticRelative)
      page = page.replace(/{{JID}}/g, server)
      room = room.replace(/{{VIDEO_UUID}}/g, video.uuid)
      page = page.replace(/{{ROOM}}/g, room)
      page = page.replace(/{{BOSH_SERVICE_URL}}/g, boshUri)
      page = page.replace(/{{WS_SERVICE_URL}}/g, wsUri)

      res.status(200)
      res.type('html')
      res.send(page)
    } catch (error) {
      next(error)
    }
  })

  changeHttpBindRoute(options, null)
  router.all('/http-bind', bodyParser.raw({ type: 'text/xml' }), (req: Request, res: Response, next: NextFunction) => {
    httpBindRoute(req, res, next)
  })
  return router
}

function changeHttpBindRoute ({ peertubeHelpers }: RegisterServerOptions, port: string | null): void {
  const logger = peertubeHelpers.logger
  logger.info('Changing http-bind port for ' + (port ?? 'null'))
  if (port !== null && !/^\d+$/.test(port)) {
    logger.error('Port is not valid. Replacing by null')
    port = null
  }
  if (port === null) {
    httpBindRoute = (_req: Request, res: Response, _next: NextFunction) => {
      res.status(404)
      res.send('Not found')
    }
  } else {
    const options: ProxyOptions = {
      https: false,
      proxyReqPathResolver: async (_req: Request): Promise<string> => {
        return '/http-bind' // should not be able to access anything else
      },
      // preserveHostHdr: false,
      parseReqBody: true // Note that setting this to false overrides reqAsBuffer and reqBodyEncoding below.
      // FIXME: should we remove cookies?
    }
    httpBindRoute = proxy('http://localhost:' + port, options)
  }
}

export {
  initWebchatRouter,
  changeHttpBindRoute
}
