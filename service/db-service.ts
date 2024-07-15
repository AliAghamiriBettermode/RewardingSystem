import MongoDB from '../database/mongodb/config.js'
import { RewardType } from '../consts/reward-reason.js'
import { getEnumKey } from '../utils/utils.js'

class DbService {
  static instance: DbService

  async getMemberPoints(memberId: string) {
    const result = await MongoDB.getInstance().collection('userPoint').aggregate([
      { $match: { memberId: memberId } },
      { $group: { _id: null, totalPoints: { $sum: '$point' } } },
    ]).toArray()
    return result[0]?.totalPoints ?? 0
  }

  async getLeaderboard() {
    return MongoDB.getInstance().collection('userPoint').aggregate([
      {
        $group: {
          _id: { memberId: '$memberId', name: '$name' },
          totalPoints: { $sum: '$point' },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          memberId: '$_id.memberId',
          name: '$_id.name',
          totalPoints: 1,
        },
      },
    ]).toArray()
  }

  async getMemberHistory(memberId: string) {
    return MongoDB.getInstance()
      .collection('userPoint')
      .find({ memberId: memberId })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray()
  }

  async addPoints(memberId: string, memberName: string, postId: string, reward: RewardType) {
    await MongoDB.getInstance().collection('userPoint').updateOne({
      memberId: memberId,
      postId: postId,
      action: getEnumKey(reward, RewardType),
    }, {
      $setOnInsert: {
        memberId: memberId,
        postId: postId,
        action: getEnumKey(reward, RewardType),
        point: reward,
        name: memberName,
        created_at: new Date(),
      },
    }, { upsert: true })
  }

  static getInstance() {
    if (!DbService.instance) {
      DbService.instance = new DbService()
    }
    return DbService.instance
  }
}

export default DbService