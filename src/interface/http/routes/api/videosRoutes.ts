import type { FastifyInstance } from "fastify";
import { videoController } from "../../controllers/videoController.ts";
import { authentication } from "../../middleware/auth.ts";

export function videosApiRoutes(fastify: FastifyInstance) {
  fastify.addHook("preValidation", authentication.isAuthenticated);

  fastify.get(
    "/videos",
    {
      schema: {
        summary: "List all videos in the user's account",
        tags: ["Videos"],
        response: {
          302: {
            description: "List of videos uploaded by the user",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                user_id: { type: "number" },
                path: { type: "string", description: "File path to the video" },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
            example: [
              {
                id: 1,
                user_id: 5,
                path: "/uploads/videos/sample_video_1.mp4",
                created_at: "2025-10-28T12:00:00Z",
                updated_at: "2025-10-28T12:00:00Z",
              },
              {
                id: 2,
                user_id: 5,
                path: "/uploads/videos/family_vacation.mov",
                created_at: "2025-10-28T13:30:00Z",
                updated_at: "2025-10-28T13:30:00Z",
              },
            ],
          },
        },
      },
    },
    videoController.list
  );

  fastify.get(
    "/video",
    {
      schema: {
        summary: "Find a specific video",
        tags: ["Videos"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        response: {
          302: {
            description: "Video details",
            type: "object",
            properties: {
              id: { type: "number" },
              user_id: { type: "number" },
              path: { type: "string", description: "File path to the video" },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" },
            },
            example: {
              id: 1,
              user_id: 5,
              path: "/uploads/videos/sample_video.mp4",
              created_at: "2025-10-28T12:00:00Z",
              updated_at: "2025-10-28T12:00:00Z",
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          404: {
            description: "Video not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
            example: {
              error: "Video not found",
            },
          },
        },
      },
    },
    videoController.find
  );

  fastify.post(
    "/video",
    {
      schema: {
        summary: "Create a new video",
        tags: ["Videos"],
        consumes: ["multipart/form-data"],
        description: `Upload a new video for people tracking and facial recognition.

**Required form fields:**
- file (file): The video file to upload (MP4, MOV, AVI, etc.)

**Supported formats:**
- Video formats: MP4, MOV, AVI, MKV, WMV
- Max file size: 100MB
- Recommended: MP4 format for best compatibility

**Example multipart form:**
- file: [upload video file]`,
        response: {
          201: {
            description: "Video uploaded successfully",
            type: "object",
            properties: {
              id: { type: "number" },
              user_id: { type: "number" },
              path: {
                type: "string",
                description: "File path to the uploaded video",
              },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" },
            },
            example: {
              id: 3,
              user_id: 5,
              path: "/uploads/videos/2025-10-28_family_gathering.mp4",
              created_at: "2025-10-28T14:15:00Z",
              updated_at: "2025-10-28T14:15:00Z",
            },
          },
          400: {
            description: "Validation error or unsupported file format",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
            example: {
              error: "Invalid file format. Only video files are allowed.",
            },
          },
          413: {
            description: "File too large",
            type: "object",
            properties: {
              error: { type: "string" },
            },
            example: {
              error: "File size exceeds maximum limit of 100MB",
            },
          },
        },
      },
    },
    videoController.create
  );

  fastify.delete(
    "/video",
    {
      schema: {
        summary: "Delete video",
        tags: ["Videos"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        response: {
          203: {
            description: "Video deleted successfully",
            type: "object",
            properties: {
              message: { type: "string" },
            },
            example: {
              message: "Video deleted successfully",
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          404: {
            description: "Video not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
            example: {
              error: "Video not found or does not belong to this user",
            },
          },
          500: {
            description: "Server error during file deletion",
            type: "object",
            properties: {
              error: { type: "string" },
            },
            example: {
              error: "Failed to delete video file from storage",
            },
          },
        },
      },
    },
    videoController.delete
  );
}
