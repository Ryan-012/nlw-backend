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
exports.UserRoutes = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
function UserRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.addHook('preHandler', (req) => __awaiter(this, void 0, void 0, function* () {
            yield req.jwtVerify();
        }));
        app.get('/users', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const users = yield prisma_1.prisma.user.findMany({
                where: {},
            });
            return users;
        }));
        app.get('/users/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().uuid(),
            });
            const { id } = paramsSchema.parse(req.params);
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id },
                include: {
                    memories: {
                        where: {
                            isPublic: true,
                        },
                        orderBy: {
                            createdAt: 'asc',
                        },
                        include: {
                            likes: true,
                        },
                    },
                },
            });
            if (!user)
                return res.callNotFound();
            return Object.assign(Object.assign({}, user), { memories: user.memories.map((memory) => {
                    return Object.assign(Object.assign({}, memory), { excerpt: memory.content.length > 50
                            ? memory.content.substring(0, 50).concat('...')
                            : memory.content });
                }) });
        }));
    });
}
exports.UserRoutes = UserRoutes;
