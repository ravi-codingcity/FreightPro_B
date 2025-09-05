const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: "No authorization header, access denied" 
    });
  }

  // Check if token starts with Bearer
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid token format, use 'Bearer <token>'" 
    });
  }

  const token = authHeader.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token provided, authorization denied" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ 
      success: false,
      message: "Token is not valid" 
    });
  }
};
