require(`dotenv`).config()

const fs = require(`fs`)
const path = require(`path`)

const mongodb = require(`mongodb`)
const { MongoClient } = mongodb

MongoClient
  .connect(`mongodb+srv://${process.env.MONGODB_HOST}`, {
    ssl: true,
    auth: {
      user: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
    },
    w: `majority`,
    useUnifiedTopology: true,
  })
  .then((client) => {
    const db = client
      .db(process.env.MONGODB_DB)

    const entries = fs.readdirSync(path.resolve(`./quest-log/entry`))
    const threads = fs.readdirSync(path.resolve(`./quest-log/thread`))

    Promise.all([
      db  
        .collection(process.env.MONGODB_ENTRY_COLLECTION)
        .insertMany(entries.map((entry) => JSON.parse(fs.readFileSync(`./quest-log/entry/${entry}`).toString())),
          {
            ordered: false,
          })
        .then(({ result }) => {
          if (result.ok) {
            console.log(`entires - done!`)
          } else {
            console.log(`there was a problem inserting entries...`)
          }
        }),
      db
        .collection(process.env.MONGODB_THREAD_COLLECTION)
        .insertMany(threads.map((thread) => JSON.parse(fs.readFileSync(`./quest-log/thread/${thread}`).toString())),
          {
            ordered: false,
          })
        .then(({ result }) => {
          if (result.ok) {
            console.log(`threads - done!`)
          } else {
            console.log(`there was a problem inserting threads...`)
          }
        }),
    ])
      .catch((err) => console.error(err))
      .finally(() => client.close())
  })
  .catch((err) => console.error(err))
