let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server/index')
let should = chai.should()

chai.use(chaiHttp)

describe('View Runs', () => {
  describe('/GET runs', () => {
    it('Should redirect since user not authenticated', (done) => {
      chai.request(server)
        .get('/runs')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })
  })
})
