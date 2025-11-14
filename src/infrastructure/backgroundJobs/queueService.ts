import { Job, Queue, Worker } from "bullmq";
import { config } from "../../config.ts";

class BullQueueService {
  private queues = new Map<string, Queue>();
  private workers = new Map<string, Worker>();

  async enqueue<T>(
    queueName: string,
    jobName: string,
    jobData: T
  ): Promise<string> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, jobData, {
      jobId: jobName,
    });
    return job.id || jobName;
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
    ]);
  }
}

export const queueService = new BullQueueService();
