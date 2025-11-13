import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod/v4";
import { findUser } from "../../../application/queries/user/findUser.ts";
import { findUsers } from "../../../application/queries/user/findUsers.ts";
import { User } from "../../../domain/user/User.ts";
import { Roles } from "../../../shared/roles.ts";
import { fileSizePolicy } from "../../../policies/fileSizePolicy.ts";
import { imagePolicy } from "../../../policies/imagePolicy.ts";
import { createRequestScopedContainer } from "../_lib/index.ts";
import { extractFileData } from "../_lib/fileDataHandler.ts";

type CreateUserDTO = {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: Roles;
  active: boolean;
};

export const userController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = CreateUserInput.safeParse(request.body);
    const { createUser } = createRequestScopedContainer();

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const { username, email, password } = parseResult.data;

    const result = await createUser({
      user: {
        username,
        email,
        password,
        role: Roles.USER,
        active: true,
      },
    });

    return reply.status(201).send(result);
  },

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
      const userId = request.userId!;
      const parseResult = UpdateUserInput.safeParse(request.body);
      const updatedId = UpdateUserParams.safeParse(request.query);

      if (!parseResult.success || !updatedId.success) {
        return reply.status(400).send({
          error: "Invalid input",
          details: [
            ...(parseResult.success ? [] : parseResult.error.issues),
            ...(updatedId.success ? [] : updatedId.error.issues),
          ],
        });
      }

      const { updateUser } = createRequestScopedContainer();

      const currentUser = await findUser({
        id: updatedId.data.id,
        user_id: userId,
      });

      const { username, email, password, role, active } = parseResult.data;

      const updateData: Partial<CreateUserDTO> = {
        id: updatedId.data.id,
        username: username ?? currentUser.username,
        email: email ?? currentUser.email,
        role: (role ?? currentUser.role) as Roles,
        active: active ?? currentUser.active,
      };

      if (password) {
        updateData.password = password;
      } else {
        updateData.password = "dummy_password_for_validation";
      }

      const userToUpdate = new User(updateData as CreateUserDTO);

      const result = await updateUser({
        user: userToUpdate,
      });

      return reply.status(200).send(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return reply.status(500).send({
        error: "Internal server error",
        message: errorMessage,
      });
    }
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;

    const parseResult = DeletePictureInput.safeParse(request.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const { deletePicture } = createRequestScopedContainer();

    await findUser({ id: parseResult.data.id, user_id: userId });

    const result = await deletePicture({ id: parseResult.data.id });

    return reply.status(204).send(result);
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = FindUsersInput.safeParse(request.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const users = await findUsers({
      active: parseResult.data.active,
      user_id: userId,
    });

    return reply.status(200).send(users);
  },

  find: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = FindUserInput.safeParse(request.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const { id } = parseResult.data;

    const user = await findUser({
      id,
      user_id: userId,
    });

    return reply.status(200).send(user);
  },
};

const CreateUserInput = z.object({
  username: z.string().nonempty().nonoptional(),
  email: z.email().nonempty().nonoptional(),
  password: z.string().nonempty().nonoptional(),
});

const UpdateUserInput = z.object({
  username: z.string().nonempty().optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  active: z.coerce.boolean().optional(),
});

const UpdateUserParams = z.object({
  id: z.number().nonnegative(),
});

const FindUserInput = z.object({
  id: z.number().nonnegative(),
});

const FindUsersInput = z.object({
  active: z.coerce.boolean().optional(),
});

const DeletePictureInput = z.object({
  id: z.number().nonnegative(),
});
