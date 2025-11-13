import { ActiveConnection } from "../../types/activeConnection.ts";

type HandleClientMessageParams = {
  sessionId: string;
  data: Buffer;
  activeConnections: Map<string, ActiveConnection>;
};

export const handleClientMessage = ({
  sessionId,
  data,
  activeConnections,
}: HandleClientMessageParams) => {
  const connection = activeConnections.get(sessionId);

  if (!connection || !connection.pythonSocket) return;

  try {
    const message = JSON.parse(data.toString());

    if (connection.pythonSocket.readyState === WebSocket.OPEN) {
      connection.pythonSocket.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error("Error handling client message:", error);
  }
};
