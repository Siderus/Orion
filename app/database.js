const { app } = require('electron')
const sqlite = require('q-sqlite3')
const { join } = require('path')
const { stat } = require('fs')

const DATABASE_PATH = join(app.getPath('userData'), "./database.sql")

/**
 * initDB will return promises with the db initialized.
 */
function initDB (){
  let db
  return stat(DATABASE_PATH)
    .then((err, stat) => {
      if(err) console.log(err)

      if(!stat.isFile()){
        db = new sqlite.createDatabase(DATABASE_PATH)
        db.run("CREATE TABLE storage (hash TEXT PRIMARY KEY ASC, filename TEXT)")
        return db
      }
      db = new sqlite.Database(DATABASE_PATH)
      return db
    }
  )
}

module.exports = {
  initDB
}