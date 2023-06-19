/// Role base access control

const rbac = (roles) => {
  return (req, res, next) => {
    const userRole = "user" || req.user;
    if (roles.includes(userRole)) {
      next();
    } else {
      return res.sendStatus(401);
    }
  };
};

module.exports = { rbac };
// Closures => ability to access data from outer function in the inner function
