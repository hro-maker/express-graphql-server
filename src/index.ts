import { Mycontext } from './types';
import { Userresolver } from './resolvres/user';
import { PostResolver } from './resolvres/posts';
import "reflect-metadata"
import { HelloResolver } from './resolvres/hello';
import { __prod__ } from './constants';
import { MikroORM } from "@mikro-orm/core";
import microconfig from './mikro-orm.config';
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql';
import redis from 'redis';
import session from 'express-session';
import conectRedis from 'connect-redis'
import cors from 'cors'


const main = async () => {
    const app = express()
    const orm = await MikroORM.init(microconfig);
    await orm.getMigrator().up();
    let RedisStore = conectRedis(session)
    let redisClient = redis.createClient()
    app.use(cors({
        origin:"http://localhost:3000",
        credentials:true
    }))
    app.use(
        session({
            name:'token',
            store: new RedisStore({
                 client: redisClient ,
                 disableTouch:true,      
                }),
                cookie:{
                    maxAge: 100 * 60 * 60 * 24 * 365 * 10,
                    httpOnly:true,
                    sameSite:'lax',
                    secure:__prod__
                },
                saveUninitialized:false,
            secret: 'keyboard cat',
            resave: false,
        })
    )
    // const post =  orm.em.create(Post,{title:'my firste post'});
    // await orm.em.persistAndFlush(post);
    //    const postts=await orm.em.find(Post,{})
    const apolloSever = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, Userresolver],
            validate: false,
        }),
        context: ({req,res}):Mycontext => ({ em: orm.em,req,res })
    })
    apolloSever.applyMiddleware({
         app ,
         cors:false,
        })
    app.listen(4000, () => {
        console.log("server startet on port 4000")
    })
}
main().catch(err => {
    console.log(err)
})