import { User } from './entitis/User';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entitis/Post';
import path from 'path'
const microconfig= {
        migrations:{
                path: path.join(__dirname,"./migrations/"),
                pattern: /^[\w-]+\d+\.[tj]s$/
        },

       entities:[Post,User],
        dbName:'lireddit',
        type:'postgresql',
        debug: !__prod__,
        user:"postgres",
        password:"tabacxur16"
       
} as Parameters<typeof MikroORM.init>[0];

export default microconfig