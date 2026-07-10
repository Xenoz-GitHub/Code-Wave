const { WebSocketServer } = require('ws')

const PORT = 3001
const wss = new WebSocketServer({ port: PORT })

const rooms = new Map()

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const projectId = url.searchParams.get('projectId')
  const userId = url.searchParams.get('userId')
  const userName = url.searchParams.get('userName') || 'Anonymous'

  if (!projectId || !userId) {
    ws.close()
    return
  }

  if (!rooms.has(projectId)) {
    rooms.set(projectId, new Map())
  }

  const room = rooms.get(projectId)
  const userColor = getColorForUser(userId)

  room.set(userId, { ws, id: userId, name: userName, color: userColor })

  broadcastUsers(projectId)

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data)

      if (msg.type === 'file-update') {
        broadcastToRoom(projectId, ws, {
          type: 'file-update',
          fileId: msg.fileId,
          content: msg.content,
          userId,
        })
      } else if (msg.type === 'file-created') {
        broadcastToRoom(projectId, ws, {
          type: 'file-created',
          file: msg.file,
          userId,
        })
      } else if (msg.type === 'file-deleted') {
        broadcastToRoom(projectId, ws, {
          type: 'file-deleted',
          fileId: msg.fileId,
          userId,
        })
      } else if (msg.type === 'import') {
        broadcastToRoom(projectId, ws, {
          type: 'import',
          files: msg.files,
          userId,
        })
      }
    } catch (e) {
      console.error('Invalid message:', e)
    }
  })

  ws.on('close', () => {
    room.delete(userId)
    if (room.size === 0) {
      rooms.delete(projectId)
    } else {
      broadcastUsers(projectId)
    }
  })

  function broadcastUsers(pid) {
    const room = rooms.get(pid)
    if (!room) return
    const users = Array.from(room.values()).map((u) => ({
      id: u.id,
      name: u.name,
      color: u.color,
    }))
    broadcastToRoom(pid, null, { type: 'users', users })
  }
})

function broadcastToRoom(projectId, senderWs, message) {
  const room = rooms.get(projectId)
  if (!room) return
  const data = JSON.stringify(message)
  room.forEach((client) => {
    if (client.ws !== senderWs && client.ws.readyState === 1) {
      client.ws.send(data)
    }
  })
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
function getColorForUser(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

console.log(`WebSocket server running on ws://localhost:${PORT}`)
