import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from './api';

class SocketService {
  private socket: Socket | null = null;
  private currentMatchId: string | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(WS_BASE_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to SportLK WebSocket Gateway:', this.socket?.id);
        if (this.currentMatchId) {
          this.socket?.emit('joinMatch', { matchId: this.currentMatchId });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      this.socket.on('error', (err) => {
        console.warn('WebSocket error:', err);
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  joinMatch(matchId: string, onMatchData?: (match: any) => void) {
    this.currentMatchId = matchId;
    const s = this.connect();

    s.emit('joinMatch', { matchId });

    if (onMatchData) {
      s.off('matchData');
      s.on('matchData', onMatchData);
    }
  }

  onScoreUpdated(callback: (payload: { matchId: string; score: any; timestamp: string }) => void) {
    const s = this.connect();
    s.off('scoreUpdated');
    s.on('scoreUpdated', callback);
  }

  onStatusChanged(callback: (payload: { matchId: string; match: any; timestamp: string }) => void) {
    const s = this.connect();
    s.off('matchStatusChanged');
    s.on('matchStatusChanged', callback);
  }

  leaveMatch(matchId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leaveMatch', { matchId });
    }
    if (this.currentMatchId === matchId) {
      this.currentMatchId = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
