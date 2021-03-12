"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./entitis/User");
const constants_1 = require("./constants");
const Post_1 = require("./entitis/Post");
const path_1 = __importDefault(require("path"));
const microconfig = {
    migrations: {
        path: path_1.default.join(__dirname, "./migrations/"),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [Post_1.Post, User_1.User],
    dbName: 'lireddit',
    type: 'postgresql',
    debug: !constants_1.__prod__,
    user: "postgres",
    password: "tabacxur16"
};
exports.default = microconfig;
//# sourceMappingURL=mikro-orm.config.js.map