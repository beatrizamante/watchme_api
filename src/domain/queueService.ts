type JobHandler = (job: { data: unknown }) => Promise<unknown>;

interface QueueService<TQueue = unknown> {
  enqueue: <T>(queueName: string, jobName: string, jobData: T) => Promise<void>;
  enqueueAndWait: <T, R>(
    queueName: string,
    jobName: string,
    jobData: T,
    timeout?: number
  ) => Promise<R>;
  getQueue: (queueName: string) => TQueue;
  addWorker: (queueName: string, handler: JobHandler) => void;
  close: () => Promise<void>;
}

export type { QueueService, JobHandler };
