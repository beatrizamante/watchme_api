import { ActiveConnection } from "../../types/activeConnection.ts";

type StopTrackingParams = {
  sessionId: string;
  activeConnections: Map<string, ActiveConnection>;
};

export const stopTracking = ({
  sessionId,
  activeConnections,
}: StopTrackingParams) => {
  const connection = activeConnections.get(sessionId);
  if (!connection) return;

  if (connection.pythonSocket?.readyState === WebSocket.OPEN) {
    connection.pythonSocket.send(
      JSON.stringify({
        type: "stop_tracking",
      })
    );
  }

  if (connection.clientSocket.readyState === WebSocket.OPEN) {
    connection.clientSocket.send(
      JSON.stringify({
        type: "tracking_stopped",
      })
    );
  }
};
