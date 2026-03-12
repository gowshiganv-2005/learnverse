let app;
try {
  // Debug logic to see what Vercel has on disk
  const fs = require('fs');
  const path = require('path');
  const serverPath = path.join(__dirname, '../backend/server.js');
  
  app = (req, res) => {
    if (req.url.includes('inspect-server')) {
      const content = fs.existsSync(serverPath) 
        ? fs.readFileSync(serverPath, 'utf8').substring(0, 500)
        : 'File not found at ' + serverPath;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('DEBUG CONTENT:\n' + content);
    }

    try {
      const server = require('../backend/server');
      return server(req, res);
    } catch (innerError) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: 'API Trapped Inner',
        message: innerError.message,
        stack: innerError.stack
      }));
    }
  };
} catch (error) {
  app = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'API Trapped Outer',
      message: error.message,
      stack: error.stack
    }));
  };
}
module.exports = app;