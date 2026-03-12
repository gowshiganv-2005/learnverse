let app;
try {
  // Debug logic to see what Vercel has on disk
  const fs = require('fs');
  const path = require('path');
  const serverPath = path.join(__dirname, '../backend/server.js');
  
  app = (req, res) => {
    if (req.url.includes('inspect-server')) {
      const content = fs.existsSync(serverPath) ? fs.readFileSync(serverPath, 'utf8') : '';
      const hasUuid = content.includes("uuid");
      const lines = content.split('\n').slice(0, 20).join('\n');
      res.setHeader('Content-Type', 'text/plain');
      return res.end('HAS UUID: ' + hasUuid + '\n\nCONTENT:\n' + lines);
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