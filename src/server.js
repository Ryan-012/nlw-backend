"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const auth_1 = require("./routes/auth");
const memories_1 = require("./routes/memories");
const upload_1 = require("./routes/upload");
const node_path_1 = require("node:path");
const user_1 = require("./routes/user");
const app = (0, fastify_1.default)();
app.get('/', (req, res) => {
    return 'Welcome!';
});
app.register(require('@fastify/static'), {
    root: (0, node_path_1.resolve)(__dirname, '../uploads'),
    prefix: '/uploads',
});
app.register(multipart_1.default);
app.register(cors_1.default, {
    origin: [
        'http://localhost:3000',
        'https://main.d3dn7d96quisvt.amplifyapp.com',
    ],
});
app.register(jwt_1.default, {
    secret: 'process.env.SECRET_KEY',
});
app.register(auth_1.authRoutes);
app.register(memories_1.memoriesRoutes);
app.register(upload_1.uploadRoutes);
app.register(user_1.UserRoutes);
app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
    console.log('server running');
});
