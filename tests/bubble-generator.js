'use strict';


//-------------//
// Pre-Imports //
//-------------//

const websiteJs = '../src/website/client/js/';

const mockRequire = require('mock-require')
  , mochaJsdom = require('mocha-jsdom')
  ;

mockRequire(websiteJs + 'utils', './mocked/utils');
mochaJsdom();


//---------//
// Imports //
//---------//


const bubbleGenerator = require(websiteJs + '/bubble/generator')
  , chai = require('chai')
  , r = require('ramda')
  , rUtils = require(websiteJs + 'r-utils')
  ;


//------//
// Init //
//------//

chai.should();

const {
  between
  , square
  , transform
} = rUtils
;

let {
  initAvailable
  , calculateNumBubbles
  , newBubble
  , getDistanceBetween
} = bubbleGenerator._;


//------//
// Main //
//------//

describe('getDistanceBetween', () => {
  it('gets the distance between two points', () => {
    const loc1 = { x: 0, y: 0 }
      , loc2 = { x: 6, y: 8 };
    getDistanceBetween()(loc1, loc2).should.equal(10);
  });
});

describe('newBubble', () => {
  it('has a working prototype', () => {
    const loc = { x: 0, y: 0 }
      , diameter = 10;

    const bub = newBubble({ loc, diameter });
    bub.radius.should.equal(5);
    bub.center.should.deep.equal({ x: 5, y: 5 });
  });
});

describe('initAvailable', () => {
  it('initializes the correct available pixels', function() {
    const nonHeaderY = r.range(0, 600)
      , headerY = r.range(201, 600)
      , expected = transform(
        (res, val) => {
          res[val] = (between(150, 350, val))
            ? headerY
            : nonHeaderY;
        }
        , {}
        , r.range(0, 600)
      );

    initAvailable(r.range(0, 600), r.range(0, 600), 100)
      .should.deep.equal(expected);
  });
});

describe('calculateNumBubbles', () => {
  it('calculates the correct number of bubbles', () => {
    const available = initAvailable(r.range(0, 600), r.range(0, 600), 100)
      , numBubbleWeight = 0.1
      , medianBubbleDiameter = 50
      , expected = Math.round((400 * 600 + 200 * 400) * numBubbleWeight / square(medianBubbleDiameter))
      ;

    calculateNumBubbles(available, medianBubbleDiameter, numBubbleWeight)
      .should.equal(expected);
  });
});
