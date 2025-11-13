import { Job } from "bullmq";
import { findPersonHandler } from "../../application/use-cases/person/findPersonHandler.ts";
import { logger } from "../../_lib/logger.ts";

type PredictionJobData = {
  person: any;
  video: any;
  userId: number;
  jobId: string;
};

class PredictionWorker {
  static async process(job: Job<PredictionJobData>) {
    const { person, video, userId, jobId } = job.data;

    try {
      logger.info(
        `Starting prediction for job ${jobId} - Person: ${person.id}, Video: ${video.id}`
      );

      await job.updateProgress(10);

      const result = await findPersonHandler({ person, video });

      await job.updateProgress(100);

      logger.info(`Prediction completed for job ${jobId} and user ${userId}`);

      return {
        person,
        video,
        userId,
        matches: result.matches || [],
      };
    } catch (error: any) {
      logger.error(`Prediction failed for job ${jobId}:`, error);
      throw error;
    }
  }
}

export { PredictionWorker };
