import { createApp } from './server.js'

const portEnv = process.env['PORT']
const parsedPort = portEnv ? Number.parseInt(portEnv, 10) : 4000
const port = Number.isNaN(parsedPort) ? 4000 : parsedPort

const { app } = createApp()
app.listen(port, () => {
  console.log(`Shadow Test Backend listening on http://localhost:${port}`)
})
