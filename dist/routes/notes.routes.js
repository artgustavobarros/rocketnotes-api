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

// src/routes/notes.routes.ts
var notes_routes_exports = {};
__export(notes_routes_exports, {
  notesRoutes: () => notesRoutes
});
module.exports = __toCommonJS(notes_routes_exports);

// src/controllers/NoteController.ts
var import_zod = require("zod");

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// src/controllers/NoteController.ts
var NoteController = class {
  create(request, reply) {
    return __async(this, null, function* () {
      const requestBodySchema = import_zod.z.object({
        title: import_zod.z.string(),
        description: import_zod.z.string(),
        tags: import_zod.z.array(import_zod.z.string()),
        links: import_zod.z.array(import_zod.z.string())
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
      const requestParamsSchema = import_zod.z.object({
        id: import_zod.z.coerce.number()
      });
      const { id } = requestParamsSchema.parse(request.params);
      const note = yield prisma.note.findUnique({ where: { id } });
      return reply.status(200).send(note);
    });
  }
  delete(request, reply) {
    return __async(this, null, function* () {
      const requestParamsSchema = import_zod.z.object({
        id: import_zod.z.coerce.number()
      });
      const { id } = requestParamsSchema.parse(request.params);
      yield prisma.note.delete({ where: { id } });
      return reply.status(200).send("Delete note sucessfully.");
    });
  }
  index(request, reply) {
    return __async(this, null, function* () {
      const requestQuerySchema = import_zod.z.object({
        title: import_zod.z.string().optional(),
        tags: import_zod.z.string().optional()
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

// src/middlewares/ensure-authenticated.ts
var ensureAuthenticated = (request, reply) => __async(void 0, null, function* () {
  try {
    yield request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized." });
  }
});

// src/routes/notes.routes.ts
var notesController = new NoteController();
var notesRoutes = (app) => __async(void 0, null, function* () {
  app.addHook("onRequest", ensureAuthenticated);
  app.post("/notes", notesController.create);
  app.delete("/notes/:id", notesController.delete);
  app.get("/notes/:id", notesController.show);
  app.get("/notes", notesController.index);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  notesRoutes
});
