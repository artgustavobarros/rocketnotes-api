"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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

// src/controllers/SessionsController.ts
var SessionsController_exports = {};
__export(SessionsController_exports, {
  SessionsController: () => SessionsController
});
module.exports = __toCommonJS(SessionsController_exports);
var import_zod = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/utils/error/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credentials");
  }
};

// src/controllers/SessionsController.ts
var import_bcryptjs = require("bcryptjs");
var SessionsController = class {
  create(request, reply) {
    return __async(this, null, function* () {
      const requestBodySchema = import_zod.z.object({
        email: import_zod.z.string(),
        password: import_zod.z.string()
      });
      const { email, password } = requestBodySchema.parse(request.body);
      const user = yield prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new InvalidCredentialsError();
      }
      const passwordMatch = yield (0, import_bcryptjs.compare)(password, user.password_hash);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SessionsController
});
