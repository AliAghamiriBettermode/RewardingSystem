import RewardingController from '../controller/rewarding-controller.js'

class BettermodeService {
  static instance: BettermodeService

  async handleSubscription(body: any) {
    const { data, entities } = body
    const { name } = data
    switch (name) {
      case 'reaction.added':
        await RewardingController.getInstance().onReactionAdded(entities.post.id, entities.post.ownerId, entities.actor.id, entities.owner.name)
        await RewardingController.getInstance().checkPostReactionAndReplies(entities.post.id, entities.post.totalRepliesCount, entities.post.reactionsCount, entities.post.ownerId, entities.owner.name)
        return {}
      case 'post.published':
        if (entities.postType.slug === 'comment') {
          await RewardingController.getInstance().onReplyAdded(entities.post.id, entities.post.ownerId, entities.actor.id, entities.owner.name)
          await RewardingController.getInstance().checkPostReactionAndReplies(entities.post.id, entities.post.totalRepliesCount, entities.post.reactionsCount, entities.post.ownerId, entities.owner.name)
        }
        return {}
      default:
        return {}
    }
  }

  async handleInteraction(body: any) {
    if (body.data.dynamicBlockKey) {
      return this.handleDynamicBlock(body)
    }
    return {}
  }

  async handleDynamicBlock(body: any) {
    switch (body.data.dynamicBlockKey) {
      case 'member-point-view':
        return RewardingController.getInstance().getMemberPoints(body.data.appId, body.data.interactionId, body.data.actorId)
      default:
        return {}
    }
  }

  static getInstance() {
    if (!BettermodeService.instance) {
      BettermodeService.instance = new BettermodeService()
    }
    return BettermodeService.instance
  }
}

export default BettermodeService






