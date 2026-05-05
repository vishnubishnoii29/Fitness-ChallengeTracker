const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    try {
      // Verify token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not configured');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Add user ID to request
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.message === 'JWT_SECRET environment variable is not configured') {
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided' });
};

module.exports = { protect };
