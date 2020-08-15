import { Server } from 'http'

import SocketIO from "socket.io";

export default class AppSocket {
  private static io: SocketIO.Server
  
  static init(httpServer: Server) {
    if (!this.io) this.io = SocketIO(httpServer)
    return this.io
  }
  
  static getIO() {
    if (!this.io) throw new Error('Socket.io not initialized')
    return this.io
  }
}