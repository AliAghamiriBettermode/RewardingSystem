import { MongoClient, Db } from 'mongodb'

class MongoDB {
  static instance: MongoDB
  client: MongoClient
  db!: Db

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_CONNECTION_URL ?? 'mongodb://localhost:27017', {})
    this.connectToDatabase().then(async (db) => {
      this.db = db
      console.log('Connected to MongoDB')
    }).catch((error) => {
      console.error('Error connecting to MongoDB', error)
    })
  }

  async connectToDatabase() {
    await this.client.connect()
    return this.client.db(process.env.MONGODB_DATABASE)
  }

  static getInstance() {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB()
    }
    return MongoDB.instance.db
  }
}

export default MongoDB