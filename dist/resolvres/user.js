"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Userresolver = void 0;
const User_1 = require("./../entitis/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
let usernamepasswordinput = class usernamepasswordinput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], usernamepasswordinput.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], usernamepasswordinput.prototype, "password", void 0);
usernamepasswordinput = __decorate([
    type_graphql_1.InputType()
], usernamepasswordinput);
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
let Userresolver = class Userresolver {
    me({ req, em }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const user = yield em.findOne(User_1.User, { id: req.session.userId });
            return user;
        });
    }
    register(options, { em, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.username.length <= 4) {
                return {
                    errors: [{
                            field: "username",
                            message: "lengt must be greater then 4"
                        }]
                };
            }
            if (options.password.length < 4) {
                return {
                    errors: [{
                            field: "password",
                            message: "length must be greater then 4"
                        }]
                };
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            const user = em.create(User_1.User, { username: options.username, password: hashedPassword });
            try {
                yield em.persistAndFlush(user);
            }
            catch (error) {
                if (error.code === "23505" || error.detail.includes("already exists")) {
                    return {
                        errors: [{
                                field: "username",
                                message: "user alredy registread"
                            }]
                    };
                }
                console.log(error);
            }
            req.session.userId = user.id;
            return { user };
        });
    }
    login(options, { em, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = em.findOneOrFail(User_1.User, { username: options.username.toLowerCase() });
            if (!user) {
                return {
                    errors: [{
                            field: "username",
                            message: "user dont found"
                        }]
                };
            }
            const verif = yield argon2_1.default.verify((yield user).password, options.password);
            if (!verif) {
                return {
                    errors: [
                        {
                            field: "password",
                            message: "password is incorect"
                        }
                    ]
                };
            }
            req.session.userId = (yield user).id;
            return { user: (yield user) };
        });
    }
    logout({ req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => req.session.destroy(err => {
                res.clearCookie('token');
                if (err) {
                    console.log(err);
                    return resolve(false);
                }
                resolve(true);
            }));
        });
    }
};
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Userresolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('options')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usernamepasswordinput, Object]),
    __metadata("design:returntype", Promise)
], Userresolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg('options')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usernamepasswordinput, Object]),
    __metadata("design:returntype", Promise)
], Userresolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], Userresolver.prototype, "logout", null);
Userresolver = __decorate([
    type_graphql_1.Resolver()
], Userresolver);
exports.Userresolver = Userresolver;
//# sourceMappingURL=user.js.map