const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
console.log('token',token)
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('decoded', decoded);
    req.user = decoded; // attach user info for next handlers
    next();
  } catch (err) {
    console.log('JWT verification error:', err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
