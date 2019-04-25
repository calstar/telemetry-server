/**
 * Access control: CalSTAR MA
 *
 * Handles GET requests to the /export endpoint.
 * Exports a function (request, response) that returns void, to be used
 * as express middleware.
 *
 * This API endpoint gives the file contents to the querier.
 *
 * For further details, refer to the design doc (linked in the README).
 */

const fs = require('fs')
const path = require('path')
const db = require('./db-interface')
const logger = require('loggy')
const Json2csvParser = require('json2csv').Parser

//const props = [ 'Time', 'Altitude', 'Temperature', 'GyroX', 'GyroY', 'GyroZ' ]

// YOUR CODE HERE
var getExport = function (req, res) {
  var id = req.params['id']
  db.pool.query(
    'SELECT * FROM DataPoint JOIN (DataType) ON DataPoint.dataTypeId=DataType.dataTypeId WHERE runId = ?',
    [id],
    function (err, results, fields) {
      if (err) {
        res.end()
        logger.error(err)
      }
      logger.info('Generating CSV of run...')
      var json_arr = []
      var names = new Set(results.map((element) => { return element.name }))
      const props = Array.from(names)
      results.forEach(element => {
        json_arr[element.dataIndex - 1] = {}
      })

      results.forEach(element => {
        json_arr[element.dataIndex - 1][element.name] = element.value
      })

      // In case defaultValue does not work as expected, add value to all unspecified values
      //   const unknownToken = '?'
      //   json_arr.forEach(element => {
      //       props.forEach(prop => {
      //           if (!(element.hasOwnProperty(prop))) {
      //               element[prop] = unknownToken
      //           }
      //       });
      //   });

      try {
        const parser = new Json2csvParser({
          fields: props,
          quote: '',
          header: true,
          defaultValue: '?'
        })
        const csv = parser.parse(json_arr)
        var filename = 'data_run' + id + '.csv'
        res.setHeader('Content-disposition', 'attachment; filename=' + filename)
        res.set('Content-Type', 'text/csv')
        logger.info('Sending csv in request...')
        res.send(csv)
      } catch (err) {
        logger.error(err)
      }
      // Cannot send file and render view at the same time; also this page should not need to render anything
      // res.render('runview', {data: results})
    }
  )
}

module.exports = getExport // rename however you want
