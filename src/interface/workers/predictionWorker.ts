/** biome-ignore-all lint/complexity/noStaticOnlyClass: TODO - alter static class */
import { Job } from "bullmq";
import { logger } from "../../_lib/logger.ts";
import { findPersonHandler } from "../../application/use-cases/person/findPersonHandler.ts";
import { Person } from "../../domain/person/Person.ts";
import { Video } from "../../domain/video/Video.ts";

export type PredictionJobData = {
  person: Person;
  video: Video;
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
        person: {
          id: person.id,
          name: person.name,
        },
        video,
        userId,
        matches: result?.matches || [],
      };
    } catch (error: unknown) {
      logger.error(`Prediction failed for job ${jobId}: ${error}`);
      throw error;
    }
  }
}

export { PredictionWorker };
