import { FastifyRequest } from "fastify";
import WebSocket from "ws";
import { videoTracker } from "../../websocket/websocketConnection.ts";

export const websocketController = async (
  connection: WebSocket,
  req: FastifyRequest
) => {
  const { personId, videoId } = req.params as {
    personId: string;
    videoId: string;
  };
  // biome-ignore lint/style/noNonNullAssertion: "Authentication middleware ensures userId exists"
  const userId = req.userId!;

  console.log(
    `WebSocket connection established for user ${userId}, person ${personId}, video ${videoId}`
  );

  videoTracker.handleConnection({
    socket: connection,
    userId: Number(userId),
    personId: Number(personId),
    videoId: Number(videoId),
  });
};
