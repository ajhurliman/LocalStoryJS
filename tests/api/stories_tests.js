'use strict';

var fs = require('fs');
var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');
var expect = chai.expect;
var url = 'http://localhost:3000';

chai.use(chaiHttp);

require('../../server');

describe('stories', function() {
  before(function() {
    mongoose.connection.collections.users.drop(function(err) {
      if (err) { console.log(err); }
    });
    mongoose.connection.collections.stories.drop(function(err) {
      if (err) { console.log(err); }
    });
  });

  var tempJWT;
  var tempStoryId;

  it('should create a new user', function(done) {
    chai.request(url)
    .post('/api/users')
    .field('email', 'test@example.com')
    .field('password', 'asdf')
    .field('passwordConfirm', 'asdf')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res.body).to.have.property('jwt').that.is.a('string');
      tempJWT = res.body.jwt;
      done();
    });
  });

  it('should add a story', function(done) {
    chai.request(url)
    .post('/api/stories')
    .set('jwt', tempJWT)
    .attach('file', __dirname + '/DSCN0119.JPG')
    .field('title', 'my cool title')
    .field('storyBody', 'the body of the story')
    .field('lat', '0.0')
    .field('lng', '51.0')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.not.have.status(500);
      expect(res.body).to.include.keys('img','title', 'storyBody', 'lat', 'lng', 'date', 'userId');
      tempStoryId = res.body._id;
      done();
    });
  });

  it('should return one story given a story id', function(done) {
    chai.request(url)
    .get('/api/stories/single/' + tempStoryId)
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.not.have.status(500);
      expect(res.body).to.include.keys('img','title', 'storyBody', 'lat', 'lng', 'date', 'userId');
      done();
    });
  });

  it('should return a story\'s image given a story id', function(done) {
    chai.request(url)
    .get('/api/stories/single/image/' + tempStoryId)
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.not.have.status(500);
      expect(res).to.have.header('transfer-encoding', 'chunked');
      //res.pipe(process.stdout);
      done();
    });
  });

  it('should get a user\'s stories', function(done) {
    chai.request(url)
    .get('/api/stories/user')
    .set('jwt', tempJWT)
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res).to.not.have.status(500);
      expect(res.body).to.be.an('array');
      done();
    });
  });

  //this is for the get('/api/stories/location') route;
  //it shows that it excludes stories outside its range
  it('should add another story', function(done) {
    chai.request(url)
    .post('/api/stories')
    .set('jwt', tempJWT)
    .field('title', 'out of range story')
    .field('storyBody', 'this story is not in range')
    .field('lat', '100.0')
    .field('lng', '100.0')
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res.body).to.include.keys('title', 'storyBody', 'lat', 'lng', 'date', 'userId');
      tempStoryId = res.body._id;
      done();
    });
  });

  it('should get stories inside a range of coordinates', function(done) {
    chai.request(url)
    .get('/api/stories/location')
    .set('latMin', -1)
    .set('latMax', 1)
    .set('lngMin', 50)
    .set('lngMax', 52)
    .end(function(err, res) {
      expect(err).to.be.null;
      expect(res.body).to.be.an('array')
        .to.have.deep.property('[0].title', 'my cool title');
     // expect(res.body[0].title).to.not.eql('out of range story');
      //expect(res.body[0].title).to.eql('my cool title');
      done();
    });
  });
});
