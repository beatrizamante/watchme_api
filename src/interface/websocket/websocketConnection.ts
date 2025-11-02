import WebSocket from "ws";
import { findPerson } from "../../application/queries/findPerson.ts";
import { ActiveConnection } from "../../types/activeConnection.ts";
import { cleanUp } from "./cleanUp.ts";
import { connectToPythonService } from "./createPythonService.ts";
import { handleClientMessage } from "./handleClientMessage.ts";

type ConnectionParams = {
  socket: WebSocket;
  userId: number;
  personId: number;
};

const activeConnections = new Map<string, ActiveConnection>();

export const handleConnection = async ({
  socket,
  userId,
  personId,
}: ConnectionParams) => {
  const sessionId = crypto.randomUUID();

  try {
    const person = await findPerson(personId, userId);

    if (!person) {
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Person not found",
        })
      );
      socket.close();
      return;
    }

    const connection: ActiveConnection = {
      clientSocket: socket,
      pythonSocket: null,
      userId,
      personId,
      sessionId,
    };

    activeConnections.set(sessionId, connection);

    await connectToPythonService({ connection, person });

    socket.on("message", (data) => {
      handleClientMessage({
        sessionId,
        data: Buffer.from(data.toString()),
        activeConnections,
      });
    });

    socket.on("close", () => {
      cleanUp({ sessionId, activeConnections });
    });

    socket.on("error", (error) => {
      console.error("Client WebSocket error:", error);
      cleanUp({ sessionId, activeConnections });
    });

    socket.send(
      JSON.stringify({
        type: "connected",
        sessionId,
        message: "Connected to video tracking service",
      })
    );
  } catch (error) {
    console.error("Error handling WebSocket connection:", error);
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Failed to initialize connection",
      })
    );
    socket.close();
  }
};
