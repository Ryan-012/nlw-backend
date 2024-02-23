"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoriesRoutes = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
function memoriesRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.addHook('preHandler', (req) => __awaiter(this, void 0, void 0, function* () {
            yield req.jwtVerify();
        }));
        app.get('/memories', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const memories = yield prisma_1.prisma.memory.findMany({
                where: {
                    userId: req.user.sub,
                },
                include: {
                    likes: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
            return memories.map((memory) => {
                return Object.assign(Object.assign({}, memory), { excerpt: memory.content.length > 50
                        ? memory.content.substring(0, 50).concat('...')
                        : memory.content });
            });
        }));
        app.get('/memories/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(req.params);
            const memory = yield prisma_1.prisma.memory.findUnique({
                where: {
                    id,
                },
            });
            if (!memory)
                return res.callNotFound();
            if (memory.userId !== req.user.sub) {
                res.status(401).send('Unauthorized');
            }
            return memory;
        }));
        app.post('/memories', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const bodySchema = zod_1.z.object({
                content: zod_1.z.string(),
                coverUrl: zod_1.z.string(),
                objectKey: zod_1.z.string(),
                isPublic: zod_1.z.coerce.boolean().default(false),
                createdAt: zod_1.z.string(),
            });
            const { content, coverUrl, isPublic, createdAt, objectKey } = bodySchema.parse(req.body);
            const memory = yield prisma_1.prisma.memory.create({
                data: {
                    content,
                    coverUrl,
                    isPublic,
                    objectKey,
                    createdAt,
                    userId: req.user.sub,
                },
                include: {
                    likes: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            return memory;
        }));
        app.put('/memories/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(req.params);
            const bodySchema = zod_1.z.object({
                content: zod_1.z.string(),
                coverUrl: zod_1.z.string(),
                objectKey: zod_1.z.string(),
                isPublic: zod_1.z.coerce.boolean().default(false),
                createdAt: zod_1.z.string(),
            });
            const { content, coverUrl, isPublic, createdAt, objectKey } = bodySchema.parse(req.body);
            let memory = yield prisma_1.prisma.memory.findUniqueOrThrow({
                where: {
                    id,
                },
            });
            if (memory.userId !== req.user.sub) {
                return res.status(401).send();
            }
            memory = yield prisma_1.prisma.memory.update({
                where: {
                    id,
                },
                data: {
                    content,
                    coverUrl,
                    objectKey,
                    isPublic,
                    createdAt,
                },
                include: {
                    likes: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            return memory;
        }));
        app.delete('/memories/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(req.params);
            const memory = yield prisma_1.prisma.memory.findUniqueOrThrow({
                where: {
                    id,
                },
            });
            if (memory.userId !== req.user.sub) {
                return res.status(401).send();
            }
            yield prisma_1.prisma.like.deleteMany({
                where: {
                    memoryId: memory.id,
                },
            });
            yield prisma_1.prisma.memory.delete({
                where: {
                    id,
                },
            });
        }));
        app.post('/memories/like', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const bodySchema = zod_1.z.object({
                memoryId: zod_1.z.string().uuid(),
                userId: zod_1.z.string().uuid(),
            });
            const { memoryId, userId } = bodySchema.parse(req.body);
            const like = prisma_1.prisma.like.create({
                data: {
                    memoryId,
                    userId,
                },
            });
            return like;
        }));
        app.delete('/memories/like/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(req.params);
            yield prisma_1.prisma.like.findUniqueOrThrow({
                where: {
                    id,
                },
            });
            return yield prisma_1.prisma.like.delete({
                where: {
                    id,
                },
            });
        }));
        app.get('/memories/like/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(req.params);
            const like = yield prisma_1.prisma.like.findMany({
                where: {
                    memoryId: id,
                },
            });
            return like;
        }));
    });
}
exports.memoriesRoutes = memoriesRoutes;
