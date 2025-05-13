import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::subreddit.subreddit', ({ strapi }) => ({
  async create(ctx) {
    const userId = ctx.state.user.id;
    ctx.request.body.data.user = userId; // Set the author to the current user
    return await super.create(ctx);
  },

  async delete(ctx) {
    const userId = ctx.state.user.id;
    const subredditId = ctx.params.id;
    const subreddit = await strapi.entityService.findOne('api::subreddit.subreddit', subredditId, { populate: ['user'] as any });

    if (!subreddit) {
      return ctx.notFound('Subreddit not found');
    }
    const subredditAny = subreddit as any;
    if (subredditAny.user.id !== userId) {
      return ctx.forbidden('You are not allowed to delete this subreddit');
    }

    return await super.delete(ctx);
  }
}));
