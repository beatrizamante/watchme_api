import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { createBullBoard } from "@bull-board/api";
import { FastifyAdapter } from "@bull-board/fastify";
import { QUEUE_NAMES } from "../../shared/queues.ts";
import { createRequestScopedContainer } from "../../interface/http/_lib/index.ts";

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
