let app;
try {
  app = require('../backend/server');
} catch (error) {
  app = (req, res) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'API Initialization Failed',
      message: error.message,
      stack: error.stack
    }));
  };
}
module.exports = app;
