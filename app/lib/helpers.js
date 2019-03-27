/**
 *  Helpers for vaious tasks
 */


 /* Dependencies */
 const crypto = require('crypto')
 const config = require('../config')

/* Container for helpers */
let helpers = {}

// Hash helper
helpers.hash = str => {
  if(typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false
  }
}


//
helpers.parseJsonToObjects = str => {
  try {
    const obj = JSON.parse(str)
    return obj
  } catch (err) {
    return {}
  }
}

/* End of Container for helpers */


/* Export helpers */
module.exports = helpers