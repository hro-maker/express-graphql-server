import { Mycontext } from './../types';
import { Post } from './../entitis/Post';
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(
        @Ctx() { em }: Mycontext
    ): Promise<Post[]> {
        return em.find(Post, {})
    }
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id') id: number,
        @Ctx() { em }: Mycontext
    ): Promise<Post | null> {
        return em.findOne(Post, { id })
    }
    @Mutation(() => Post)
    async createpost(
        @Arg('title') title: string,
        @Ctx() { em }: Mycontext
    ): Promise<Post> {
        const post = em.create(Post, { title })
        await em.persistAndFlush(post)
        return post;
    }
    @Mutation(() => Post, { nullable: true })
    async updatepost(
        @Arg('title', () => String, { nullable: true }) title: string,
        @Arg('id') id: number,
        @Ctx() { em }: Mycontext
    ): Promise<Post | null> {
        const post = await em.findOne(Post, { id })
        if (!post) {
            return null
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            await em.persistAndFlush(post)
        }
        return post;
    }
    @Mutation(() => Boolean)
    async deletepost(
        @Arg('id') id: number,
        @Ctx() { em }: Mycontext
    ): Promise<Boolean> {

        em.nativeDelete(Post, { id })
        return true
    }
}