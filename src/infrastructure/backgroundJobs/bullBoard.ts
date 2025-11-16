import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";
import { createRequestScopedContainer } from "../../interface/http/_lib/index.ts";
import { QUEUE_NAMES } from "../../shared/queues.ts";

const serverAdapter = new FastifyAdapter();
serverAdapter.setBasePath("/queues");
const { queueService } = createRequestScopedContainer();

createBullBoard({
  queues: Object.values(QUEUE_NAMES).map(
    (queueName) => new BullMQAdapter(queueService.getQueue(queueName))
  ),
  serverAdapter,
});

export { serverAdapter };
