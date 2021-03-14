import { User } from './../entitis/User';
import { Mycontext } from './../types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';

@InputType()
class usernamepasswordinput{
    @Field()
    username:string
    @Field()
    password:string
}

@ObjectType()
class FieldError{
    @Field()
    field:string
    @Field()
    message:string
}


@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}


@Resolver()
export class Userresolver {
@Query(()=> User,{nullable:true})
async me(
    @Ctx() {req,em}:Mycontext
){
    if(!req.session.userId){
        return null
    }
    const user=await em.findOne(User,{id:req.session.userId})
    return user
}


@Mutation(()=> UserResponse)
 async register (
    @Arg('options') options:usernamepasswordinput,
    @Ctx() {em,req}:Mycontext
    ): Promise<UserResponse> {
        if(options.username.length <=4){
            return {
                errors:[{
                    field:"username",
                    message:"lengt must be greater then 4"
                }]
            }
        }
        if(options.password.length <4){
            return {
                errors:[{
                    field:"password",
                    message:"length must be greater then 4"
                }]
            }
        }
    const hashedPassword =await argon2.hash(options.password)
    const user =em.create(User,{username:options.username,password:hashedPassword})
        try {
            await em.persistAndFlush(user)
        } catch (error) {
            if(error.code === "23505" || error.detail.includes("already exists")){
                return {
                    errors:[{
                        field:"username",
                        message:"user alredy registread"
                    }]
                }
            }
            console.log(error)   
        }
    
        req.session!.userId= user.id
    return {user}
}
@Mutation(()=> UserResponse)
 async login (
    @Arg('options') options:usernamepasswordinput,
    @Ctx() {em,req}:Mycontext
    ): Promise<UserResponse> {
    const user= em.findOneOrFail(User,{username:options.username.toLowerCase()})
      if(!user){
        return{
            errors:[{
                    field:"username",
                    message:"user dont found"
                }]
        }
    }
    const verif =await argon2.verify((await user).password,options.password)
    if(!verif){
            return {
                errors:[
                    {
                        field:"password",
                        message:"password is incorect"
                    }
                ]
            }
    }

    req.session!.userId= (await user).id
         return {user:(await user)}

    }

@Mutation(()=>Boolean)
async logout(
    @Ctx(){req,res}:Mycontext
){
    
  return  new Promise(resolve => req.session.destroy(err=>{
    res.clearCookie('token')
        if(err){
            console.log(err)
            return resolve(false)
        }
        resolve(true)
    }))
}


}