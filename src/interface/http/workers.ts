import { Job } from "bullmq";
import Fastify from "fastify";
import { serverAdapter } from "../../infrastructure/backgroundJobs/bullBoard.ts";
import { QUEUE_NAMES } from "../../shared/queues.ts";
import {
  PredictionJobData,
  PredictionWorker,
} from "../workers/predictionWorker.ts";
import { createRequestScopedContainer } from "./_lib/index.ts";

const makeWorkerServer = async () => {
  const server = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024,
  });
  const { queueService } = createRequestScopedContainer();

  server.register(serverAdapter.registerPlugin(), { prefix: "/queues" });

  server.addHook("onReady", async () => {
    queueService.addWorker(QUEUE_NAMES.PREDICT_PERSON, async (job) => {
      return PredictionWorker.process(job as Job<PredictionJobData>);
    });

    server.log.info("Bull workers initialized");
  });

  server.addHook("onClose", async () => {
    await queueService.close();
    server.log.info("Queue service closed");
  });

  return server;
};

export { makeWorkerServer };
