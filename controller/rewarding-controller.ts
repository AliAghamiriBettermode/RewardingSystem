import { RewardType } from '../consts/reward-reason.js'
import DbService from '../service/db-service.js'
import _ from 'lodash'
import { InteractionType } from '../consts/interaction-type.js'

class RewardingController {
  static instance: RewardingController

  async onReactionAdded(postId: string, postOwnerId: string, memberId: string, memberName: string) {
    if (postOwnerId !== process.env.ADMIN_MEMBER_ID) {
      console.log('Ignoring...')
      return {}
    }
    await this.addPoints(memberId, memberName, postId, RewardType.REACT)
  }

  async onReplyAdded(postId: string, postOwnerId: string, memberId: string, memberName: string) {
    if (postOwnerId !== process.env.ADMIN_MEMBER_ID) {
      console.log('Ignoring...')
      return {}
    }
    await this.addPoints(memberId, memberName, postId, RewardType.COMMENT)
  }

  async checkPostReactionAndReplies(postId: string, totalRepliesCount: number, reactionsCount: number, ownerId: string, memberName: string) {
    if (totalRepliesCount + reactionsCount >= 5) {
      await this.addPoints(ownerId, memberName, postId, RewardType.POPULAR_POST)
    }
  }

  async addPoints(memberId: string, memberName: string, postId: string, reason: RewardType) {
    await DbService.getInstance().addPoints(memberId, memberName, postId, reason)
  }

  async getMemberPoints(appId: string, interactionId: string, memberId: string) {
    const totalPoints = await DbService.getInstance().getMemberPoints(memberId)
    const leaderboard = await DbService.getInstance().getLeaderboard()
    const memberHistory = await DbService.getInstance().getMemberHistory(memberId)
    return {
      type: 'INTERACTION',
      status: 'SUCCEEDED',
      data: {
        interactions: [
          {
            id: interactionId,
            type: InteractionType.SHOW,
            slate: {
              rootBlock: 'root',
              blocks: [
                {
                  id: 'root',
                  name: 'Card',
                  children: JSON.stringify(['body']),
                  props: JSON.stringify({}),
                },
                {
                  id: 'body',
                  name: 'Card.Content',
                  children: JSON.stringify(['total_points', 'divider_1', 'leaderboard', 'divider_2', 'member_history']),
                  props: JSON.stringify({}),
                },
                {
                  id: 'total_points',
                  name: 'Container',
                  children: JSON.stringify(['title', 'points']),
                  props: JSON.stringify({
                    direction: 'grid',
                    size: 'full',
                  }),
                },
                {
                  id: 'title',
                  name: 'Text',
                  children: JSON.stringify([]),
                  props: JSON.stringify({ value: 'Total Points', size: 'md' }),
                },
                {
                  id: 'points',
                  name: 'Text',
                  children: JSON.stringify([]),
                  props: JSON.stringify({ value: `${totalPoints} ⭐️`, size: 'md' }),
                },
                {
                  id: 'divider_1',
                  name: 'Divider',
                  children: JSON.stringify([]),
                  props: JSON.stringify({}),
                },
                {
                  id: 'leaderboard',
                  name: 'Container',
                  children: JSON.stringify(['leaderboard_title', ..._.map(leaderboard, (item, index) => `leaderboard_${index}_container`)]),
                  props: JSON.stringify({
                    direction: 'vertical',
                    size: 'full',
                  }),
                },
                {
                  id: 'leaderboard_title',
                  name: 'Text',
                  children: JSON.stringify([]),
                  props: JSON.stringify({ value: 'Leaderboard', size: 'md' }),
                },
                ..._.map(leaderboard, (item, index) => {
                  return [
                    {
                      id: `leaderboard_${index}_container`,
                      name: 'Container',
                      children: JSON.stringify([`leaderboard_${index}_name`, `leaderboard_${index}_points`]),
                      props: JSON.stringify({
                        direction: 'grid',
                        size: 'full',
                      }),
                    },
                    {
                      id: `leaderboard_${index}_name`,
                      name: 'Text',
                      children: JSON.stringify([]),
                      props: JSON.stringify({ value: `${index + 1}. ${item.name ?? item.memberId}` }),
                    },
                    {
                      id: `leaderboard_${index}_points`,
                      name: 'Text',
                      children: JSON.stringify([]),
                      props: JSON.stringify({ value: `${item.totalPoints} ⭐️` }),
                    },
                  ]
                }).flat(),
                {
                  id: 'divider_2',
                  name: 'Divider',
                  children: JSON.stringify([]),
                  props: JSON.stringify({}),
                },
                {
                  id: 'member_history',
                  name: 'Container',
                  children: JSON.stringify(['member_history_title', ..._.map(memberHistory, (item, index) => `member_history_${index}_container`)]),
                  props: JSON.stringify({
                    direction: 'vertical',
                    size: 'full',
                  }),
                },
                {
                  id: 'member_history_title',
                  name: 'Text',
                  children: JSON.stringify([]),
                  props: JSON.stringify({ value: 'Reward Log', size: 'md' }),
                },
                ..._.map(memberHistory, (item, index) => {
                  return [
                    {
                      id: `member_history_${index}_container`,
                      name: 'Container',
                      children: JSON.stringify([`member_history_${index}_action`, `member_history_${index}_point`]),
                      props: JSON.stringify({
                        direction: 'grid',
                        size: 'full',
                      }),
                    },
                    {
                      id: `member_history_${index}_action`,
                      name: 'Text',
                      children: JSON.stringify([]),
                      props: JSON.stringify({ value: _.startCase(_.lowerCase(item.action)) }),
                    },
                    {
                      id: `member_history_${index}_point`,
                      name: 'Text',
                      children: JSON.stringify([]),
                      props: JSON.stringify({ value: `${item.point} ⭐️` }),
                    },
                  ]
                }).flat(),
              ],
            },
          },
        ],
      },
    }
  }

  async getMemberPointsHTML(memberId: string) {
    const totalPoints = await DbService.getInstance().getMemberPoints(memberId)
    const leaderboard = await DbService.getInstance().getLeaderboard()
    const memberHistory = await DbService.getInstance().getMemberHistory(memberId)
    return `<div  class="border border-card flex flex-col text-content-subdued transition duration-200 justify-between bg-surface shadow-card sm:rounded-card block-card" data-block-id="root" data-block-name="card">
              <div class="flex-1 px-4 py-5 sm:p-6 block-card-content" data-block-id="body" data-block-name="card-content">
                <div
                  class="w-full grid grid-cols-1 sm:grid-cols-2 max-w-full self-center gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 py-0 sm:py-0 md:py-0 lg:py-0 px-0 sm:px-0 md:px-0 lg:px-0">
                  <span class="text-md block-text" data-block-id="title" data-block-name="text">Total Points</span>
                  <span class="text-md block-text" data-block-id="points" data-block-name="text">${totalPoints} ⭐️</span>
                </div>
                <div class="relative py-4 block-divider" data-block-id="divider_1" data-block-name="divider">
                  <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-line">
                    </div>
                  </div>
                  <div class="relative flex justify-center">
                    <span class="px-2 bg-surface text-content-subdued">
                    </span>
                  </div>
                </div>
                <div
                  class="w-full flex flex-col max-w-full self-center space-y-3 sm:space-y-3.5 md:space-y-4 lg:space-y-5 py-0 sm:py-0 md:py-0 lg:py-0 px-0 sm:px-0 md:px-0 lg:px-0">
                  <span class="text-md block-text" data-block-id="leaderboard_title" data-block-name="text">Leaderboard</span>
                  ${_.map(leaderboard, (item, index) => {return `<div class="w-full grid grid-cols-1 sm:grid-cols-2 max-w-full self-center gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 py-0 sm:py-0 md:py-0 lg:py-0 px-0 sm:px-0 md:px-0 lg:px-0">
                    <span class="text-sm block-text" data-block-id="leaderboard_${index}_name" data-block-name="text">${index + 1}. ${item.name ?? item.memberId}</span>
                    <span class="text-sm block-text" data-block-id="leaderboard_${index}_points" data-block-name="text">${item.totalPoints} ⭐️</span>
                  </div>`}).join('')}
                </div>
                <div class="relative py-4 block-divider" data-block-id="divider_2" data-block-name="divider">
                  <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t border-line"></div>
                  </div>
                  <div class="relative flex justify-center"><span class="px-2 bg-surface text-content-subdued"></span></div>
                </div>
                <div
                  class="w-full flex flex-col max-w-full self-center space-y-3 sm:space-y-3.5 md:space-y-4 lg:space-y-5 py-0 sm:py-0 md:py-0 lg:py-0 px-0 sm:px-0 md:px-0 lg:px-0">
                  <span class="text-md block-text" data-block-id="member_history_title" data-block-name="text">Reward Log</span>
                  ${_.map(memberHistory, (item, index) => {
                    return `<div class="w-full grid grid-cols-1 sm:grid-cols-2 max-w-full self-center gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 py-0 sm:py-0 md:py-0 lg:py-0 px-0 sm:px-0 md:px-0 lg:px-0">
                    <span class="text-sm block-text" data-block-id="member_history_${index}_action" data-block-name="text">${_.startCase(_.lowerCase(item.action))}</span>
                          <span class="text-sm block-text" data-block-id="member_history_${index}_point" data-block-name="text">+ ${item.point}️</span>
                          </div>`
                  }).join('')}
                </div>
              </div>
            </div>`
  }

  static getInstance(): RewardingController {
    if (!this.instance) {
      this.instance = new RewardingController()
    }
    return this.instance
  }
}

export default RewardingController