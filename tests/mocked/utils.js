'use strict';


//------//
// Main //
//------//

const h1p = 'h1 + p'
  , header = 'header'
  ;

const getRoundedRectangleProps = selector => {
  switch (selector) {
    case h1p:
      return { left: 250, right: 350 };

    case header:
      return { bottom: 200 };

    default:
      throw new Error("Invalid Input: mock getRoundedRectangleProps requires\n "
        + "the selector to be either '" + h1p + "' or '" + header + "'\n"
        + "selector: " + selector
      );
  }
};


//---------//
// Exports //
//---------//

module.exports = {
  getRoundedRectangleProps
};
