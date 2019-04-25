/**
 * Access control: CalSTAR MA
 *
 * Handles POST requests to the /upload endpoint.
 * Exports a function (request, response) that returns void, to be used
 * as express middleware.
 *
 * This API endpoint handles uploads of raw test files; for now, these
 * files can be .wbpz (ANSYS files used by sims) or .csv; we only need
 * to worry about parsing .csv files. The .csv files should be parsed,
 * and their data uploaded into the SQL database as appropriate.
 *
 * For further details, refer to the design doc (linked in the README).
 */

const db = require('./db-interface')
const parse = require('csv-parse/lib/sync')
const logger = require('loggy')
const fs = require('fs')
const path = require('path')

const csvSaveDir = path.join(__dirname, '..', 'data')

var handleErr = function (err) {
  if (err) {
    logger.error(err)
    return false
  } else {
    return true
  }
}

var insertData = function (dataIndex, runId, dataTypeId, value, callback) {
  db.pool.execute(
    'INSERT INTO DataPoint ( dataIndex, runId, dataTypeId, value ) VALUES ( ?, ?, ?, ?)',
    [dataIndex, runId, dataTypeId, value],
    callback
  )
}

var saveCSV = function (runId, runFile) {
  fs.writeFile(path.join(csvSaveDir, 'run-' + runId + '.csv'), runFile.data, function (err) {
    if (err) {
      logger.error('Error writing CSV for run-' + runId)
      logger.error(err)
    } else {
      logger.log('Wrote CSV for run-' + runId)
    }
  })
}

var postUpload = function (req, res, next) {
  var runfileText = req.files.runfile.data.toString()
  // WARNING: Do not mix \r\n and \n
  const runData = parse(runfileText, {
    columns: true,
    trim: true,
    skip_empty_lines: true
  })

  var runId = 1 // will find correct run after databse insertion
  var count = 0

  // Create a new run
  db.pool.execute(
    'INSERT INTO runs (runName) VALUES (?)', ['req.files.runfile.name'],
    function (err, results, fields) {
      if (err) {
        logger.error('Error inserting into runs (from upload.js)')
        logger.error(err)
        res.redirect('/uploadfail')
      } else {
        runId = results.insertId
        logger.log(`Inserted run with runId = ${runId}`)

        saveCSV(runId, req.files.runfile)
        var count = runData.length * Object.keys(runData[0]).length

        db.pool.query(
          'SELECT * FROM DataType', [],
          function (err, datatypes, fields) {
            if (handleErr(err)) {
              dataTypeId = {}
              datatypes.forEach(function (element) {
                dataTypeId[element.name] = element.dataTypeId
              })

              Object.keys(runData[0]).forEach(key => {
                if (!(key in dataTypeId)) {
                  dataTypeId[key] = -1
                  db.pool.execute(
                    'INSERT INTO DataType (type, name, units) VALUES (\'Unkown\', ?, \'Unkown\')',
                    [key],
                    function (err, results, fields) {
                      if (handleErr(err)) {
                        dataTypeId[key] = results.insertId
                        // insert all data with this key
                        runData.forEach(function (row, index) {
                          db.pool.execute(
                            'INSERT INTO DataPoint (dataIndex, runId, dataTypeId, value) VALUES (?, ?, ?, ?)',
                            [index, runId, dataTypeId[key], row[key]],
                            function (err) {
                              if (err) {
                                logger.error('Error inserting into runs (from upload.js)')
                                logger.error(err)
                                return res.redirect('/uploadfail')
                              } else {
                                count -= 1
                                if (count === 0) {
                                  return res.redirect('/uploadsuccess')
                                }
                              }
                            }
                          )
                        })
                      }
                    }
                  )
                } else {
                  runData.forEach(function (row, index) {
                    db.pool.execute(
                      'INSERT INTO DataPoint (dataIndex, runId, dataTypeId, value) VALUES (?, ?, ?, ?)',
                      [index, runId, dataTypeId[key], row[key]],
                      function (err) {
                        if (err) {
                          logger.error('Error inserting into runs (from upload.js)')
                          logger.error(err)
                          return res.redirect('/uploadfail')
                        } else {
                          count -= 1
                          if (count === 0) {
                            return res.redirect('/uploadsuccess')
                          }
                        }
                      }
                    )
                  })
                }
              })
            }
          }
        )
      }
    }
  )
}

module.exports = postUpload // rename if you want
