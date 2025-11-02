import WebSocket from "ws";

export type ActiveConnection = {
  clientSocket: WebSocket;
  pythonSocket?: WebSocket | null;
  userId: number;
  personId: number;
  videoId: number;
  sessionId: string;
};
