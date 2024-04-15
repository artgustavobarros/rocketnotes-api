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

// src/routes/tags.routes.ts
var tags_routes_exports = {};
__export(tags_routes_exports, {
  tagsRoutes: () => tagsRoutes
});
module.exports = __toCommonJS(tags_routes_exports);

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/controllers/TagController.ts
var TagController = class {
  index(request, reply) {
    return __async(this, null, function* () {
      const tags = yield prisma.tag.groupBy({ by: "name" });
      return reply.status(200).send(tags);
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

// src/routes/tags.routes.ts
var tagsController = new TagController();
var tagsRoutes = (app) => __async(void 0, null, function* () {
  app.get("/tags", { onRequest: ensureAuthenticated }, tagsController.index);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  tagsRoutes
});
