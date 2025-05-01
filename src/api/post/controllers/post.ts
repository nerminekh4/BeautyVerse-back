/**
 * post controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async like(ctx) {
    const { id } = ctx.params;

    console.log('like endpoint called with id:', id);

    // Convert id to number if possible
    const postId = Number(id);

    // Find the post by id with populate if needed
    const post = await strapi.service('api::post.post').findOne(postId, {
      populate: ['subreddit', 'users_permissions_user'], // fixed field names
      publicationState: 'preview', // include drafts and published
    });

    console.log('post found:', post);

    if (!post) {
      return ctx.notFound('Post not found');
    }

    // Increment likes count (assuming a 'likes' field exists)
    const updatedPost = await strapi.service('api::post.post').update(postId, {
      data: {
        likes: (post.likes || 0) + 1,
      },
    });

    ctx.body = updatedPost;
  },

  async popular(ctx) {
    // Fetch posts sorted by likes descending, limit to 10
    const popularPosts = await strapi.service('api::post.post').find({
      sort: { likes: 'desc' },
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
      filters.users_permissions_user = { username: author }; // fixed field name
    }

    const posts = await strapi.service('api::post.post').find({
      filters,
      ...restQuery,
    });

    ctx.body = posts;
  },
}));
