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
exports.uploadRoutes = void 0;
const aws_sdk_1 = require("aws-sdk");
const crypto_1 = require("crypto");
const path_1 = require("path");
const zod_1 = require("zod");
function uploadRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        const s3 = new aws_sdk_1.S3();
        app.post('/upload', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const upload = yield req.file({
                limits: {
                    fileSize: 5242800, // 5mb
                },
            });
            if (!upload)
                return res.status(400).send();
            const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
            const isValidFileFormat = mimeTypeRegex.test(upload.mimetype);
            if (!isValidFileFormat)
                return res.status(400).send();
            const fileId = (0, crypto_1.randomUUID)();
            const extension = (0, path_1.extname)(upload.filename);
            const fileName = fileId.concat(extension);
            const params = {
                Bucket: 'nlw-spacetime-project',
                Key: fileName,
                Body: upload.file,
                ACL: 'public-read-write',
            };
            try {
                yield s3.upload(params).promise();
                const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
                return { fileUrl, objectKey: params.Key };
            }
            catch (error) {
                console.error(error);
                return res.status(500).send();
            }
        }));
        app.delete('/deleteImage/:objectKey', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                objectKey: zod_1.z.string(),
            });
            const { objectKey } = paramsSchema.parse(req.params);
            const params = {
                Bucket: 'nlw-spacetime-project',
                Key: objectKey,
            };
            try {
                yield s3.deleteObject(params).promise();
            }
            catch (error) {
                console.log(error);
                return res.status(500).send();
            }
        }));
    });
}
exports.uploadRoutes = uploadRoutes;
