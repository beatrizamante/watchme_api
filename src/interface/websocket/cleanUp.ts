import { ActiveConnection } from "../../types/activeConnection.ts";

type CleanUpParams = {
  sessionId: string;
  activeConnections: Map<string, ActiveConnection>;
};
export const cleanUp = ({ sessionId, activeConnections }: CleanUpParams) => {
  const connection = activeConnections.get(sessionId);
  if (!connection) return;

  if (connection.pythonSocket) {
    connection.pythonSocket.close();
  }

  activeConnections.delete(sessionId);
  console.log(`Cleaned up session ${sessionId}`);
};
