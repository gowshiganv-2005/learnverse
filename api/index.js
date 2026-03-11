let app;
try {
  app = require('../backend/server');
} catch (error) {
  app = (req, res) => {
    res.statusCode = 200; // Return 200 so Vercel doesn't intercept with a 500 HTML page!
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'API Trapped V2',
      message: error.message,
      stack: error.stack
    }));
  };
}
module.exports = app;