/**
 * Access control: CalSTAR MA
 *
 * Handles GET requests to the /runs and /runs/{id} endpoints.
 * The former returns a list of all runs stored on the server (probably along
 * with some information about each, such as date, description, name, and ID).
 * The latter returns more specific information/metadata for a given run.
 *
 * For further details, refer to the design doc (linked in the README).
 */

const fs = require('fs')
const path = require('path')
const db = require('./db-interface')
const logger = require('loggy')

var getRuns = function (req, res) {
  db.pool.query(
    'SELECT * FROM Runs WHERE NOT deleted',
    function (err, results, fields) {
      if (err) {
        res.end()
        logger.error(err)
      }
      res.render('runs', { runs: results })
      // logger.info(results) // results contains rows returned by server
      // logger.info(fields) // fields contains extra meta data about results, if available
    }
  )
}

var getRun = function (req, res) {
  var id = req.params['id']
  db.pool.query(
    'SELECT DataPoint.dataIndex, DataPoint.dataTypeId, DataPoint.value, DataType.name FROM DataPoint'+
    ' JOIN DataType ON DataPoint.dataTypeId=DataType.dataTypeId'+
    ' WHERE runId = ?',
    [id],
    function (err, results, fields) {
      if (err) {
        res.end()
        logger.error(err)
      }
      results.sort((ptA, ptB) => { return (ptA.dataIndex - ptB.dataIndex) + (ptA.dataTypeId - ptB.dataTypeId) * results.length })
      var dataDict = []
      var pointSet = (new Set(results.map(point => point.name)))
      var pointAmt = results.length/pointSet.size
      for (var i = 0; i < results.length; i++) {
        //console.log(results[i].value+' '+results[i].name)
        var point = results[i]
        if (dataDict.length < i % pointAmt + 1) {
            dataDict.push({})
        }
        dataDict[i % pointAmt][point.name] = point.value
        
      }
      
      //console.log(Object.keys(dataDict[0]))
      var realData = dataDict.map((pts) => {
        var newPtsList = Object.keys(pts).map((type) => { return { point: pts[type] }})
        return { row: newPtsList }
      })
      var types = Array.from(pointSet).map((type) => { return { measurement: type } })
      //console.log(realData[0].row)
      
      res.render('runview', { runId: id, data: realData, type: types })//realData, types
    }
  )
}

var removeRun = function (req, res) {
  var id = req.params['id']
  logger.log('Deleting run...')

  db.pool.execute(
    'UPDATE Runs SET deleted = TRUE WHERE runId = ?', [id],
    function (err, results) {
      if (err) {
        logger.error('Error deleting run (from runs.js)')
        logger.error(err)
        res.redirect('/uploadfail')
      } else {
        res.redirect('/runs')
      }
    }
  )
  logger.log('Executed soft deletion on run ' + id)
  // logger.info('The params: ' + Object.keys(req))
}

module.exports.getRuns = getRuns
module.exports.getRun = getRun
module.exports.removeRun = removeRun

