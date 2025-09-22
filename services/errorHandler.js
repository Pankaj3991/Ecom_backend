class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ErrorHandler;
// we can't directly use this ErroHandler function, we need to create error.js file into middleware folder.
