"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/routes/users.routes.ts
var users_routes_exports = {};
__export(users_routes_exports, {
  usersRoutes: () => usersRoutes
});
module.exports = __toCommonJS(users_routes_exports);

// src/controllers/UserController.ts
var import_zod = require("zod");

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
        const createBodySchema = import_zod.z.object({
          name: import_zod.z.string(),
          email: import_zod.z.string(),
          password: import_zod.z.string()
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
        if (err instanceof import_zod.ZodError) {
          return reply.status(409).send("Invalid credentials");
        }
        throw err;
      }
    });
  }
  update(request, reply) {
    return __async(this, null, function* () {
      const requestBodySchema = import_zod.z.object({
        name: import_zod.z.string().optional(),
        password: import_zod.z.string().optional(),
        email: import_zod.z.string().optional(),
        old_password: import_zod.z.string().optional()
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
      const requestParamasSchema = import_zod.z.object({
        id: import_zod.z.string()
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
var usersRoutes = (app) => __async(void 0, null, function* () {
  app.post("/users", usersController.create);
  app.put(
    "/users",
    { onRequest: [ensureAuthenticated] },
    usersController.update
  );
  app.patch(
    "/users/avatar",
    { onRequest: [ensureAuthenticated] },
    usersController.avatar
  );
  app.get("/file/:id", usersController.showAvatar);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  usersRoutes
});
