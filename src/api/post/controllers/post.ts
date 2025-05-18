import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;
    ctx.request.body.data.user = userId; 
    return await super.create(ctx);
  },

  async delete(ctx) {
    const userId = ctx.state.user.id;
    const postId = ctx.params.id;
    const post = await strapi.entityService.findOne('api::post.post', postId, { populate: ['user'] });

    if (!post) {
      return ctx.notFound('Post not found');
    }
    const postAny = post as any;
    if (postAny.user.id !== userId) {
      return ctx.forbidden('You are not allowed to delete this post');
    }

    return await super.delete(ctx);
  },

  async like(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to like a post');
    }

    const postId = Number(id);

    // Find the post with current likes relation
    const post: any = await strapi.entityService.findOne('api::post.post', postId, {
      populate: ['likes'],
    });

    if (!post) {
      return ctx.notFound('Post not found');
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.some((liker: any) => liker.id === user.id);

    if (alreadyLiked) {
      return ctx.badRequest('You have already liked this post');
    }

    // Add user to likes relation using connect
    const updatedPost = await strapi.entityService.update('api::post.post', postId, {
      data: {
        likes: {
          connect: [user.id],
        },
        like_count: (Number(post.like_count) || 0) + 1,
      } as any,
      populate: ['likes'],
    });

    ctx.body = updatedPost;
  },

  async unlike(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to unlike a post');
    }

    const postId = Number(id);

    // Find the post with current likes relation
    const post: any = await strapi.entityService.findOne('api::post.post', postId, {
      populate: ['likes'],
    });

    if (!post) {
      return ctx.notFound('Post not found');
    }

    // Check if user has liked the post
    const likedIndex = post.likes.findIndex((liker: any) => liker.id === user.id);

    if (likedIndex === -1) {
      return ctx.badRequest('You have not liked this post');
    }

    // Remove user from likes relation using disconnect
    const updatedPost = await strapi.entityService.update('api::post.post', postId, {
      data: {
        likes: {
          disconnect: [user.id],
        },
        like_count: Math.max((Number(post.like_count) || 1) - 1, 0),
      } as any,
      populate: ['likes'],
    });

    ctx.body = updatedPost;
  },

  async getLikers(ctx) {
    const { id } = ctx.params;

    const postId = Number(id);

    const post: any = await strapi.entityService.findOne('api::post.post', postId, {
      populate: ['likes'],
    });

    if (!post) {
      return ctx.notFound('Post not found');
    }

    ctx.body = post.likes;
  },

  async getLikeCount(ctx) {
    const { id } = ctx.params;

    const postId = Number(id);

    const post: any = await strapi.entityService.findOne('api::post.post', postId);

    if (!post) {
      return ctx.notFound('Post not found');
    }

    ctx.body = { like_count: Number(post.like_count) || 0 };
  },

  async popular(ctx) {
    // Fetch posts sorted by like_count descending, limit to 10
    const popularPosts = await strapi.service('api::post.post').find({
      sort: { like_count: 'desc' },
      limit: 10,
    });

    ctx.body = popularPosts;
  },

  async find(ctx) {
    // Override default find to add filtering by subreddit or author
    const { subreddit, author, ...restQuery } = ctx.query;

    const filters: Record<string, any> = {};

    if (subreddit) {
      filters.subreddit = { slug: subreddit };
    }

    if (author) {
      filters.users_permissions_user = { username: author };
    }

    const posts = await strapi.service('api::post.post').find({
      filters,
      ...restQuery,
    });

    ctx.body = posts;
  },
}));
