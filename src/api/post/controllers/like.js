import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  async like(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to like a post');
    }

    const postId = Number(id);

    // Find the post with current likes relation
    const post = await strapi.entityService.findOne('api::post.post', postId, {
      populate: ['likes'],
    });

    if (!post) {
      return ctx.notFound('Post not found');
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.some(liker => liker.id === user.id);

    if (alreadyLiked) {
      return ctx.badRequest('You have already liked this post');
    }

    // Add user to likes relation
    const updatedPost = await strapi.entityService.update('api::post.post', postId, {
      data: {
        likes: [...post.likes.map(liker => liker.id), user.id],
        like_count: (post.like_count || 0) + 1,
      },
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
    const post = await strapi.entityService.findOne('api::post.post', postId, {
      populate: ['likes'],
    });

    if (!post) {
      return ctx.notFound('Post not found');
    }

    // Check if user has liked the post
    const likedIndex = post.likes.findIndex(liker => liker.id === user.id);

    if (likedIndex === -1) {
      return ctx.badRequest('You have not liked this post');
    }

    // Remove user from likes relation
    const newLikes = post.likes.filter(liker => liker.id !== user.id).map(liker => liker.id);

    const updatedPost = await strapi.entityService.update('api::post.post', postId, {
      data: {
        likes: newLikes,
        like_count: Math.max((post.like_count || 1) - 1, 0),
      },
      populate: ['likes'],
    });

    ctx.body = updatedPost;
  },

  async getLikers(ctx) {
    const { id } = ctx.params;

    const postId = Number(id);

    const post = await strapi.entityService.findOne('api::post.post', postId, {
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

    const post = await strapi.entityService.findOne('api::post.post', postId);

    if (!post) {
      return ctx.notFound('Post not found');
    }

    ctx.body = { like_count: post.like_count || 0 };
  },
}));
