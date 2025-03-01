module.exports = (AsyncAwaitError) => (req, res, next) => {
       Promise.resolve(AsyncAwaitError(req,res,next)).catch(next);
}