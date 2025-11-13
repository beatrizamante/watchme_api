import { FastifyRequest } from "fastify";
import WebSocket from "ws";
import z from "zod/v4";
import { handleConnection } from "../../websocket/websocketConnection.ts";

export const websocketController = async (
  connection: WebSocket,
  request: FastifyRequest
) => {
  try {
    console.log("WebSocket connection attempt started");
    const parseResult = FindPersonInput.safeParse(request.query);

    if (!parseResult.success) {
      connection.send(
        JSON.stringify({
          type: "error",
          message: `personId is required in query parameters: ${parseResult.error.issues}`,
        })
      );
      connection.close();
    }

    // biome-ignore lint/style/noNonNullAssertion: "Authentication middleware ensures userId exists"
    const userId = request.userId!;

    console.log(
      `WebSocket connection established for user ${userId}, person ${parseResult.data?.personId}`
    );

    await handleConnection({
      socket: connection,
      userId: Number(userId),
      personId: Number(parseResult.data?.personId),
    });

    console.log("handleConnection completed successfully");
  } catch (error) {
    console.error("WebSocket controller error:", error);
    connection.send(
      JSON.stringify({
        type: "error",
        message: "Failed to establish connection",
      })
    );
    connection.close();
  }
};

const FindPersonInput = z.object({
  personId: z.number().nonnegative(),
});
