/**
 *  These are the request handlers
 * 
 */

/* Dependencies */
const _data = require('./data')
const helpers = require('./helpers')


/* Defines the handlers */
let handlers = {}


/* Users Handlers Container */
  handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'patch', 'delete']

    if(acceptableMethods.indexOf(data.method) > -1){
      handlers._users[data.method](data, callback)
    } else {
      callback(405)
    }
  }

  /* Users Sub methods */
  handlers._users = {}


  /**
   * Users - post
   * Required data: firstName, lastName, phone, tosAgreement, tosAgreement
   * Optional data: none
   */
  handlers._users.post = (data, callback) => {
    //  Check that all required fields are filled out
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length >= 11 ? data.payload.phone.trim() : false
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

    if(firstName && lastName && phone && password && tosAgreement) {
      //  Make sure that the user doesn't already exist
      _data.read('users', phone, (err, data) => {
        //  We expect an error if user is does not exist
        if(err){
          //  Hash the password (user Node built in CRYPTO)
          let hashedPassword = helpers.hash(password)
          if(hashedPassword){
            //  Create User Object
            let userObject = {
              'firstName' : firstName,
              'lastName' : lastName,
              'phone' : phone,
              'hashedPassword' : hashedPassword,
              'tosAgreement' : true,
            }

            //  Store the user
            _data.create('users', phone, userObject, err => {
              if(!err){
                callback(200)
              } else {
                callback(500, {'Error': 'Could not create the new user'})
              }
            })

          } else {
            callback(500, {'Error' : 'Could not hash the password'})
          }
          
        } else {
          //  User already exist
          callback(400, {'Error' : 'A user with that phone number already exist'})
        }
      })
    } else {
      callback(400, {'Error':'Missing required fields'})
    }

  }  

  /**
   *  Users - get
   *  Required data: phone
   *  Optional data: none
   *  @TODO only let an authenticated user access their own data, Don't let user access other user data
   */
  handlers._users.get = (data, callback) => {
    //  Check the phone is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length ? data.queryStringObject.phone : false

    if(phone) {
      //  Lookup the user
      _data.read('users', phone, (err, data) => {
        if(!err && data) {
          //  Remove the hash password before returning it to the requester
          delete data.hashedPassword;
          callback(200, data)
        } else {
          callback(404, {'Message' : 'Phone number was not found'})
        }
      })
    } else {
      callback(400, {'Message': 'You need to add a query @param: \'phone\' = [phone number] '})
    }
  } 

  /**
   *  Users - put
   *  Required data: phone
   *  Optional data: firstName, lastName, password (atleast one must be specified)
   *  @TODO only let an authenticated user update their own data, Don't let user update other user data
   */
  handlers._users.put = (data, callback) => {
    //  Check for the required field
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.length ? data.payload.phone : false
    
    //  Check for the optional fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    //  Check if phone is valid
    if(phone){
      //  Error if nothins is sent to update
      if(firstName || lastName || password){
        //   Lookup the user
        _data.read('users', phone, (err, userData) => {
          if(!err && userData){
            //  Update the fields necessary
            if(firstName) {
              userData.firstName = firstName
            }

            if(lastName) {
              userData.lastName = lastName
            }

            if(password) {
              userData.hashedPassword = helpers.hash(password)
            }

            //  Store the new update
            _data.update('users', phone, userData, err => {
              if(!err){
                callback(200)
              } else {
                console.log(err)
                callback(500, {'Error' : 'Could not update the user, please contact the webmaster'})
              }
            })
          } else {
            callback(400, {'Error': 'User was not found'})
          }
        })
      } else {
        callback(400, {'Error' : 'Missing fields to update'})
      }
    } else {
      callback(400, {'Error': 'Missing required fields'})
    }
  } 

  //  Users - patch
  handlers._users.patch = (data, callback) => {

  } 

  /**
   *  Users - delete
   *  Required data: phone
   *  @TODO only let an authenticated user update their own data, Don't let user update other user data
   *  @TODO Cleanup (Delete) any user data associated with the user object
   */
  handlers._users.delete = (data, callback) => {
    //  Check the phone is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length ? data.queryStringObject.phone : false

    if(phone) {
      //  Lookup the user
      _data.read('users', phone, (err, data) => {
        if(!err && data) {
          //  Remove the hash password before returning it to the requester
          _data.delete('users', phone, err => {
            if(!err) {
              callback(200)
            } else {
              callback(500, {'Error' : 'Could not delete the user'})
            }
          })
        } else {
          callback(400, {'Error' : 'Phone number was not found'})
        }
      })
    } else {
      callback(400, {'Error': 'Phone number is not assosicated to any user'})
    }
  } 

/* End of Users Handlers Container */




/* Ping handler Container */
  handlers.ping = (data, callback) => {
    callback(200)
  }
/* End of Ping handler Container */




/* NOT FOUND handler Container */
  handlers.notFound = (data, callback) => {
    callback(404)
  }
/* End of NOT FOUND handler Container */



/* Export the handlers */
module.exports = handlers