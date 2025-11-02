import WebSocket from "ws";
import { Person } from "../../domain/Person.ts";
import { ActiveConnection } from "../../types/activeConnection.ts";

type ConnectionToPyServiceParams = {
  connection: ActiveConnection;
  person: Person;
};

export const connectToPythonService = async ({
  connection,
  person,
}: ConnectionToPyServiceParams) => {
  try {
    const pythonSocket = new WebSocket(
      `ws://localhost:5000/video-stream/${connection.sessionId}`
    );

    connection.pythonSocket = pythonSocket;

    pythonSocket.on("open", () => {
      console.log(
        `Connected to Python AI service for session ${connection.sessionId}`
      );

      pythonSocket.send(
        JSON.stringify({
          type: "initialize",
          person: {
            ...person,
            embedding: person.embedding.toString("base64"),
          },
          settings: {
            fps_limit: 10,
            confidence_threshold: 0.8,
          },
        })
      );
    });

    pythonSocket.on("message", (data) => {
      if (connection.clientSocket.readyState === WebSocket.OPEN) {
        connection.clientSocket.send(data);
      }
    });

    pythonSocket.on("error", (error) => {
      console.error("Python WebSocket error:", error);
      if (connection.clientSocket.readyState === WebSocket.OPEN) {
        connection.clientSocket.send(
          JSON.stringify({
            type: "error",
            message: "Connection to AI service lost",
          })
        );
      }
    });

    pythonSocket.on("close", () => {
      console.log(
        `Python WebSocket closed for session ${connection.sessionId}`
      );
      if (connection.clientSocket.readyState === WebSocket.OPEN) {
        connection.clientSocket.send(
          JSON.stringify({
            type: "disconnected",
            message: "AI service disconnected",
          })
        );
      }
    });
  } catch (error) {
    console.error("Failed to connect to Python service:", error);
    throw error;
  }
};
