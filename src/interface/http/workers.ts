import Fastify from "fastify";
import { serverAdapter } from "../../infrastructure/backgroundJobs/bullBoard.ts";
import { queueService } from "../../infrastructure/backgroundJobs/queueService.ts";
import { PredictionWorker } from "../workers/predictionWorker.ts";
import { QUEUE_NAMES } from "../../shared/queues.ts";

const makeWorkerServer = async () => {
  const server = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024,
  });

  server.register(serverAdapter.registerPlugin(), { prefix: "/queues" });

  server.addHook("onReady", async () => {
    queueService.addWorker(
      QUEUE_NAMES.PREDICT_PERSON,
      PredictionWorker.process
    );

    server.log.info("Bull workers initialized");
  });

  server.addHook("onClose", async () => {
    await queueService.close();
    server.log.info("Queue service closed");
  });

  return server;
};

export { makeWorkerServer };
