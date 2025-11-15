import { Job, Queue, QueueEvents, Worker } from "bullmq";
import { config } from "../../config.ts";

class BullQueueService {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();
  private queueEvents = new Map<string, QueueEvents>();

  async enqueue<T>(
    queueName: string,
    jobName: string,
    jobData: T
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.add(jobName, jobData, {
      jobId: jobName,
    });
  }

  async enqueueAndWait<T, R>(
    queueName: string,
    jobName: string,
    jobData: T,
    timeout: number = 30000000
  ): Promise<R> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, jobData, {
      jobId: jobName,
    });

    const queueEvents = this.getQueueEvents(queueName);
    const result = await job.waitUntilFinished(queueEvents, timeout);

    return result as R;
  }

  getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, { connection: config.redis });
      this.queues.set(queueName, queue);
    }
    const existingQueue = this.queues.get(queueName);
    if (!existingQueue) {
      throw new Error(`Queue ${queueName} not found`);
    }
    return existingQueue;
  }

  private getQueueEvents(queueName: string): QueueEvents {
    if (!this.queueEvents.has(queueName)) {
      const queueEvents = new QueueEvents(queueName, {
        connection: config.redis,
      });
      this.queueEvents.set(queueName, queueEvents);
    }
    const existingQueueEvents = this.queueEvents.get(queueName);
    if (!existingQueueEvents) {
      throw new Error(`QueueEvents ${queueName} not found`);
    }
    return existingQueueEvents;
  }

  addWorker(queueName: string, handler: (job: Job) => Promise<unknown>): void {
    if (this.workers.has(queueName)) {
      return;
    }

    const worker = new Worker(queueName, handler, { connection: config.redis });

    worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    this.workers.set(queueName, worker);
  }

  async close(): Promise<void> {
    await Promise.all([
      ...Array.from(this.queues.values()).map((q) => q.close()),
      ...Array.from(this.workers.values()).map((w) => w.close()),
      ...Array.from(this.queueEvents.values()).map((qe) => qe.close()),
    ]);
  }
}

export const queueService = new BullQueueService();
