const { app } = require('electron')
const Datastore = require('nedb')
const { join } = require('path')

const DATABASE_PATH = join(app.getPath('userData'), "./Database/")

/**
 * initDB will start a db instance
 */
function initDB (){
  const db = {};
  db.storage = new Datastore({filename: join(DATABASE_PATH, "./storage") })
  db.settings = new Datastore({filename: join(DATABASE_PATH, "./settings")})
  return db
}

module.exports = {
  initDB
}