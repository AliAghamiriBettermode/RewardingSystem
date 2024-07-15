import BlueBird from 'bluebird'
import dotenv from 'dotenv'
import MongoDB from '../database/mongodb/config.js'
import RewardingController from '../controller/rewarding-controller.js'

dotenv.config()
const mongodb = MongoDB.getInstance()
new BlueBird(async (resolve, reject) => {
  await BlueBird.delay(3000)
  const result = await RewardingController.getInstance().getMemberPointsHTML('test')
  resolve(result)
}).then((result) => {
  if (result) {
    console.log(result)
  }
  process.exit(0)
})