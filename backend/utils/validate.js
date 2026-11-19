const mongoose = require('mongoose');

const isString = (v) => typeof v === 'string';

// Escape user input before using it inside a RegExp (prevents ReDoS / regex injection)
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isObjectId = (v) => isString(v) && mongoose.isValidObjectId(v);

// Express middleware: 400 when any of the named route params is not a valid ObjectId
const validateIdParams = (...names) => (req, res, next) => {
  for (const name of names) {
    if (!isObjectId(req.params[name])) {
      return res.status(400).json({ message: `Invalid ${name}` });
    }
  }
  next();
};

module.exports = { isString, escapeRegex, isObjectId, validateIdParams };
