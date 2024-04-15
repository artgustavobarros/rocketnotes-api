"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/server.ts
var import_fastify = __toESM(require("fastify"));

// src/env/index.ts
var import_zod = require("zod");
var import_config = require("dotenv/config");
var envSchema = import_zod.z.object({
  PORT: import_zod.z.coerce.number().default(3333),
  NODE_ENV: import_zod.z.enum(["dev", "test", "production"]).default("dev"),
  JWT_SECRET: import_zod.z.string()
});
var response = envSchema.safeParse(process.env);
if (!response.success) {
  console.error("Invalid environment variables.", response.error.format());
  throw new Error("Invalid environment variables.");
}
var env = response.data;

// src/controllers/UserController.ts
var import_zod2 = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/utils/error/user-already-exists-error.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("User already exists.");
  }
};

// src/controllers/UserController.ts
var import_bcryptjs = require("bcryptjs");

// src/utils/error/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

// src/utils/error/change-password-error.ts
var ChangePasswordError = class extends Error {
  constructor() {
    super("Insert old password to change it.");
  }
};

// src/controllers/UserController.ts
var import_util = __toESM(require("util"));
var import_stream = require("stream");
var import_fs = __toESM(require("fs"));
var pump = import_util.default.promisify(import_stream.pipeline);
var UsersController = class {
  create(request, reply) {
    return __async(this, null, function* () {
      try {
        const createBodySchema = import_zod2.z.object({
          name: import_zod2.z.string(),
          email: import_zod2.z.string(),
          password: import_zod2.z.string()
        });
        const { name, email, password } = createBodySchema.parse(request.body);
        const checkUserWithSameEmail = yield prisma.user.findUnique({
          where: { email }
        });
        if (checkUserWithSameEmail) {
          throw new UserAlreadyExistsError();
        }
        const password_hash = yield (0, import_bcryptjs.hash)(password, 8);
        yield prisma.user.create({
          data: { name, email, password_hash }
        });
        return reply.status(201).send("Created user.");
      } catch (err) {
        if (err instanceof import_zod2.ZodError) {
          return reply.status(409).send("Invalid credentials");
        }
        throw err;
      }
    });
  }
  update(request, reply) {
    return __async(this, null, function* () {
      const requestBodySchema = import_zod2.z.object({
        name: import_zod2.z.string().optional(),
        password: import_zod2.z.string().optional(),
        email: import_zod2.z.string().optional(),
        old_password: import_zod2.z.string().optional()
      });
      const { name, password, email, old_password } = requestBodySchema.parse(
        request.body
      );
      const id = Number(request.user.sub);
      const user = yield prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new InvalidCredentialsError();
      }
      if (email) {
        const userWithSameEmail = yield prisma.user.findUnique({
          where: { email }
        });
        if (userWithSameEmail && userWithSameEmail.id !== id) {
          throw new UserAlreadyExistsError();
        }
      }
      if (password && !old_password) {
        throw new ChangePasswordError();
      }
      if (password && old_password) {
        const checkOldPassword = yield (0, import_bcryptjs.compare)(old_password, user.password_hash);
        if (!checkOldPassword) {
          throw new ChangePasswordError();
        }
        user.password_hash = yield (0, import_bcryptjs.hash)(password, 8);
      }
      yield prisma.user.update({
        where: { id },
        data: {
          name: name != null ? name : user.name,
          email: email != null ? email : user.email,
          password_hash: user.password_hash,
          updated_at: /* @__PURE__ */ new Date()
        }
      });
      return reply.status(200).send(user);
    });
  }
  avatar(request, reply) {
    return __async(this, null, function* () {
      const data = yield request.file();
      const { filename } = data;
      const hashedFilename = `${crypto.randomUUID()}-${filename}`;
      const tempPath = import_fs.default.createWriteStream(`src/temp/${hashedFilename}`);
      yield pump(data.file, tempPath);
      const id = request.user.sub;
      const user_id = Number(id);
      const user = yield prisma.user.findUnique({ where: { id: user_id } });
      const { avatar } = user;
      if (avatar) {
        import_fs.default.promises.unlink(`src/temp/${avatar}`);
      }
      if (!user) {
        throw new InvalidCredentialsError();
      }
      yield prisma.user.update({
        where: { id: user_id },
        data: {
          avatar: hashedFilename
        }
      });
      return reply.status(201).send(avatar);
    });
  }
  showAvatar(request, reply) {
    return __async(this, null, function* () {
      const requestParamasSchema = import_zod2.z.object({
        id: import_zod2.z.string()
      });
      const { id } = requestParamasSchema.parse(request.params);
      if (id) {
        const buffer = import_fs.default.readFileSync(`src/temp/${id}`);
        const myStream = new import_stream.Readable({
          read() {
            this.push(buffer);
            this.push(null);
          }
        });
        reply.type("image/png");
        reply.send(myStream);
      }
    });
  }
};

// src/middlewares/ensure-authenticated.ts
var ensureAuthenticated = (request, reply) => __async(void 0, null, function* () {
  try {
    yield request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized." });
  }
});

// src/routes/users.routes.ts
var usersController = new UsersController();
var usersRoutes = (app2) => __async(void 0, null, function* () {
  app2.post("/users", usersController.create);
  app2.put(
    "/users",
    { onRequest: [ensureAuthenticated] },
    usersController.update
  );
  app2.patch(
    "/users/avatar",
    { onRequest: [ensureAuthenticated] },
    usersController.avatar
  );
  app2.get("/file/:id", usersController.showAvatar);
});

// src/controllers/NoteController.ts
var import_zod3 = require("zod");
var NoteController = class {
  create(request, reply) {
    return __async(this, null, function* () {
      const requestBodySchema = import_zod3.z.object({
        title: import_zod3.z.string(),
        description: import_zod3.z.string(),
        tags: import_zod3.z.array(import_zod3.z.string()),
        links: import_zod3.z.array(import_zod3.z.string())
      });
      const { title, description, tags, links } = requestBodySchema.parse(
        request.body
      );
      const user_id = Number(request.user.sub);
      const note = yield prisma.note.create({
        data: { title, description, tags, links, user_id }
      });
      const { id } = note;
      links.map((link) => __async(this, null, function* () {
        yield prisma.link.create({
          data: {
            note_id: id,
            url: link
          }
        });
      }));
      tags.map((tag) => __async(this, null, function* () {
        yield prisma.tag.create({
          data: {
            note_id: id,
            name: tag,
            user_id
          }
        });
      }));
      return reply.status(200).send("Note sucessfully created.");
    });
  }
  show(request, reply) {
    return __async(this, null, function* () {
      const requestParamsSchema = import_zod3.z.object({
        id: import_zod3.z.coerce.number()
      });
      const { id } = requestParamsSchema.parse(request.params);
      const note = yield prisma.note.findUnique({ where: { id } });
      return reply.status(200).send(note);
    });
  }
  delete(request, reply) {
    return __async(this, null, function* () {
      const requestParamsSchema = import_zod3.z.object({
        id: import_zod3.z.coerce.number()
      });
      const { id } = requestParamsSchema.parse(request.params);
      yield prisma.note.delete({ where: { id } });
      return reply.status(200).send("Delete note sucessfully.");
    });
  }
  index(request, reply) {
    return __async(this, null, function* () {
      const requestQuerySchema = import_zod3.z.object({
        title: import_zod3.z.string().optional(),
        tags: import_zod3.z.string().optional()
      });
      const { title, tags } = requestQuerySchema.parse(request.query);
      const user_id = Number(request.user.sub);
      const arrTags = tags == null ? void 0 : tags.split(",").map((tag) => tag.trim());
      let notes;
      if (tags) {
        notes = yield prisma.note.findMany({
          where: { tags: { hasSome: arrTags } }
        });
      } else {
        notes = yield prisma.note.findMany({
          where: { user_id, title: { contains: title } }
        });
      }
      return reply.status(200).send(notes);
    });
  }
};

// src/routes/notes.routes.ts
var notesController = new NoteController();
var notesRoutes = (app2) => __async(void 0, null, function* () {
  app2.addHook("onRequest", ensureAuthenticated);
  app2.post("/notes", notesController.create);
  app2.delete("/notes/:id", notesController.delete);
  app2.get("/notes/:id", notesController.show);
  app2.get("/notes", notesController.index);
});

// src/controllers/TagController.ts
var TagController = class {
  index(request, reply) {
    return __async(this, null, function* () {
      const tags = yield prisma.tag.groupBy({ by: "name" });
      return reply.status(200).send(tags);
    });
  }
};

// src/routes/tags.routes.ts
var tagsController = new TagController();
var tagsRoutes = (app2) => __async(void 0, null, function* () {
  app2.get("/tags", { onRequest: ensureAuthenticated }, tagsController.index);
});

// src/controllers/SessionsController.ts
var import_zod4 = require("zod");
var import_bcryptjs2 = require("bcryptjs");
var SessionsController = class {
  create(request, reply) {
    return __async(this, null, function* () {
      const requestBodySchema = import_zod4.z.object({
        email: import_zod4.z.string(),
        password: import_zod4.z.string()
      });
      const { email, password } = requestBodySchema.parse(request.body);
      const user = yield prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new InvalidCredentialsError();
      }
      const passwordMatch = yield (0, import_bcryptjs2.compare)(password, user.password_hash);
      if (!passwordMatch) {
        throw new InvalidCredentialsError();
      }
      const token = yield reply.jwtSign(
        {},
        {
          sign: {
            sub: String(user.id)
          }
        }
      );
      const refreshToken = yield reply.jwtSign(
        {},
        {
          sign: {
            sub: String(user.id),
            expiresIn: "1d"
          }
        }
      );
      return reply.setCookie("refreshToken", refreshToken, {
        path: "/",
        secure: true,
        sameSite: true,
        httpOnly: true
      }).status(200).send({ user, token });
    });
  }
};

// src/routes/sessions.routes.ts
var sessionsController = new SessionsController();
var sessionsRoutes = (app2) => __async(void 0, null, function* () {
  app2.post("/sessions", sessionsController.create);
});

// src/server.ts
var import_jwt = __toESM(require("@fastify/jwt"));
var import_cookie = __toESM(require("@fastify/cookie"));
var import_multipart = __toESM(require("@fastify/multipart"));
var import_cors = __toESM(require("@fastify/cors"));
var app = (0, import_fastify.default)();
app.register(import_jwt.default, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: "10m" },
  cookie: { cookieName: "refreshToken", signed: false }
});
app.register(import_cors.default, {});
app.register(import_cookie.default);
app.register(import_multipart.default);
app.register(usersRoutes);
app.register(notesRoutes);
app.register(tagsRoutes);
app.register(sessionsRoutes);
var PORT = env.PORT;
app.listen({ port: PORT }).then(() => {
  console.log(`Server running on port ${PORT}`);
});
