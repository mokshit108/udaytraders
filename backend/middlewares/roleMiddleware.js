// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function checkRole(requiredRoleid) {
  return (req, res, next) => {
   // sessionStorage.setItem("roleid", result.user.role_id.toString());
    const roleid = 1
    if ( roleid !== requiredRoleid) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = {
  checkRole,
};
