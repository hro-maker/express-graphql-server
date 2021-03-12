import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import {Request, Response } from 'express';
export type Mycontext={
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    req:Request & {session: Express.Session};
    res:Response
}