import WebSocket from "ws";
import { findPerson } from "../../application/queries/findPerson.ts";
import { findVideo } from "../../application/queries/findVideo.ts";
import { ActiveConnection } from "../../types/activeConnection.ts";
import { cleanUp } from "./cleanUp.ts";
import { connectToPythonService } from "./createPythonService.ts";
import { handleClientMessage } from "./handleClientMessage.ts";

type ConnectionParams = {
  socket: WebSocket;
  userId: number;
  personId: number;
  videoId: number;
};

const activeConnections = new Map<string, ActiveConnection>();

export const handleConnection = async ({
  socket,
  userId,
  personId,
  videoId,
}: ConnectionParams) => {
  const sessionId = crypto.randomUUID();

  try {
    const person = await findPerson(personId, userId);
    const video = await findVideo(videoId, userId);

    if (!person || !video) {
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Person or video not found",
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
      videoId,
      sessionId,
    };

    activeConnections.set(sessionId, connection);

    await connectToPythonService({ connection, person, video });

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
