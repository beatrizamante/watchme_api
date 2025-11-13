import { ActiveConnection } from "../../types/activeConnection.ts";

type GetUserSessionParams = {
  userId: number;
  activeConnections: Map<string, ActiveConnection>;
};

export const getUserSessions = ({
  userId,
  activeConnections,
}: GetUserSessionParams): string[] => {
  const sessions: string[] = [];
  for (const [sessionId, connection] of activeConnections) {
    if (connection.userId === userId) {
      sessions.push(sessionId);
    }
  }
  return sessions;
};
