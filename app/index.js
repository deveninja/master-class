/**
 *  @author Ice Blue http://bobbeidinoy.tk/
 * 
 *  Primary file
/

/* Dependencies */
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')
const handlers = require('./lib/handlers')
const helpers = require('./lib/helpers')



/* Instantiating the HTTP server */
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res)
})

/* Start the HTTP server */
httpServer.listen(config.httpPort, () => {
   console.log(`The server is listening at port ${config.httpPort}`)
})


/* Instantiating the HTTPS server */
const httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res)
})

/* Start the HTTPS server */
httpsServer.listen(config.httpsPort, () => {
   console.log(`The server is listening at port ${config.httpsPort}`)
})

//  All the server logic for both the http and https server
const unifiedServer = (req, res) => {
  //Get the URL and parse it
  const parsedUrl = url.parse(req.url, true)


  //Get the path from that URL
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  //Get the query string as an object
  const queryStringObject = parsedUrl.query

  //Get the HTTP methodand normalize to lower case for all types of methods
  const method = req.method.toLowerCase()

  //Get the headers as an object
  const headers = req.headers

  // Get the payload if there is any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', data => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    buffer += decoder.end()

    //  Choose which handler this request should go to, if the request is not found, use the NOT FOUND handler
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    //  Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObjects(buffer)
    }

    //  Route the request to the handler specified in the router
    chosenHandler(data, (statuCode, payload) => {
      //  Use the statud code called back by the handler, or default to 200
      statuCode = typeof(statuCode) == 'number' ? statuCode : 200

      //Use the payload called back by the handler, default to and empty object
      payload = typeof(payload) == 'object' ? payload : {}

      //  Convert the payload to a string
      let payloadString = JSON.stringify(payload)

      //  Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statuCode)
      res.end(payloadString)

      //Log the request path
      console.log('Returning these response: ', statuCode, payloadString)

    })
  })

}



/* Defines a request router */
let router = {
  'ping' : handlers.ping,
  'not found' : handlers.notFound,
  'users' : handlers.users
}