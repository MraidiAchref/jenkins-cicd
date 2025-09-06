const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const proxyquire = require('proxyquire').noCallThru();

chai.should();
chai.use(chaiHttp);

/* ----------------------------- Mock: mongoose ----------------------------- */
let findOneMode = 'resolve'; // 'resolve' | 'reject'
let findOneValue = null;

const mockMongoose = {
  connect: sinon.stub().resolves(), // no real DB
  Schema: function () {},
  model: sinon.stub().callsFake(() => ({
    findOne: sinon.stub().callsFake(() => ({
      lean() { return this; },
      exec: sinon.stub().callsFake(() => {
        return findOneMode === 'resolve'
          ? Promise.resolve(findOneValue)
          : Promise.reject(findOneValue);
      }),
    })),
  })),
};

/* ---------------------------- Load app WITH mock --------------------------- */
const app = proxyquire('./app', {
  mongoose: mockMongoose,
});

/* ------------------------------- Test Suite -------------------------------- */
describe('Planets API Suite (with mocked Mongoose)', () => {
  before(() => {
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    sinon.restore();
    findOneMode = 'resolve';
    findOneValue = null;
  });

  describe('Fetching Planet Details', () => {
    it('should fetch Mercury (id=1)', (done) => {
      findOneValue = { id: 1, name: 'Mercury' };
      chai.request(app)
        .post('/planet')
        .send({ id: 1 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 1, name: 'Mercury' });
          done();
        });
    });

    it('should fetch Venus (id=2)', (done) => {
      findOneValue = { id: 2, name: 'Venus' };
      chai.request(app)
        .post('/planet')
        .send({ id: 2 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 2, name: 'Venus' });
          done();
        });
    });

    it('should fetch Earth (id=3)', (done) => {
      findOneValue = { id: 3, name: 'Earth' };
      chai.request(app)
        .post('/planet')
        .send({ id: 3 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 3, name: 'Earth' });
          done();
        });
    });

    it('should fetch Mars (id=4)', (done) => {
      findOneValue = { id: 4, name: 'Mars' };
      chai.request(app)
        .post('/planet')
        .send({ id: 4 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 4, name: 'Mars' });
          done();
        });
    });

    it('should fetch Jupiter (id=5)', (done) => {
      findOneValue = { id: 5, name: 'Jupiter' };
      chai.request(app)
        .post('/planet')
        .send({ id: 5 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 5, name: 'Jupiter' });
          done();
        });
    });

    it('should fetch Saturn (id=6)', (done) => {
      findOneValue = { id: 6, name: 'Saturn' }; // fix spelling
      chai.request(app)
        .post('/planet')
        .send({ id: 6 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 6, name: 'Saturn' });
          done();
        });
    });

    it('should fetch Uranus (id=7)', (done) => {
      findOneValue = { id: 7, name: 'Uranus' };
      chai.request(app)
        .post('/planet')
        .send({ id: 7 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 7, name: 'Uranus' });
          done();
        });
    });

    it('should fetch Neptune (id=8)', (done) => {
      findOneValue = { id: 8, name: 'Neptune' };
      chai.request(app)
        .post('/planet')
        .send({ id: 8 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ id: 8, name: 'Neptune' });
          done();
        });
    });

    it('400 when id is not a number', (done) => {
      chai.request(app)
        .post('/planet')
        .send({ id: 'abc' })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.deep.equal({ error: 'Invalid id' });
          done();
        });
    });

    it('404 when planet not found', (done) => {
      findOneValue = null; // findOne resolves to null
      chai.request(app)
        .post('/planet')
        .send({ id: 999 })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.deep.equal({ error: 'Planet not found' });
          done();
        });
    });

    it('500 when DB error occurs', (done) => {
      findOneMode = 'reject';
      findOneValue = new Error('db down');
      chai.request(app)
        .post('/planet')
        .send({ id: 2 })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.deep.equal({ error: 'Server error' });
          done();
        });
    });
  });

  describe('Testing Other Endpoints', () => {
    it('GET /os returns 200', (done) => {
      chai.request(app)
        .get('/os')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('env', 'test');
          res.body.should.have.property('os');
          done();
        });
    });

    it('GET /live returns {status: "live"}', (done) => {
      chai.request(app)
        .get('/live')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ status: 'live' });
          done();
        });
    });

    it('GET /ready returns {status: "ready"}', (done) => {
      chai.request(app)
        .get('/ready')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ status: 'ready' });
          done();
        });
    });

    it('GET /api-docs returns JSON on success', (done) => {
      const readStub = sinon.stub(fs, 'readFile')
        .callsFake((_, __, cb) =>
          cb(null, JSON.stringify({ openapi: '3.0.0', info: { title: 'API' } }))
        );

      chai.request(app)
        .get('/api-docs')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.deep.equal({ openapi: '3.0.0', info: { title: 'API' } });
          readStub.restore();
          done();
        });
    });

    it('GET /api-docs returns 500 on read error', (done) => {
      const readStub = sinon.stub(fs, 'readFile')
        .callsFake((_, __, cb) => cb(new Error('boom')));

      chai.request(app)
        .get('/api-docs')
        .end((err, res) => {
          res.should.have.status(500);
          res.text.should.contain('Error reading file');
          readStub.restore();
          done();
        });
    });

    it('GET / serves index.html (created during test)', (done) => {
      const appDir = path.dirname(require.resolve('../app.js'));
      const idx = path.join(appDir, 'index.html');
      fs.writeFileSync(idx, '<!doctype html><html><body>OK</body></html>');
      chai.request(app)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.contain('OK');
          fs.unlinkSync(idx);
          done();
        });
    });
  });
});
