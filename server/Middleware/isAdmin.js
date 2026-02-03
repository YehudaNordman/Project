const isAdmin = (req, res, next) => {
  if ( req.user.admin) {
    console.log(req.user.admin);
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};
module.exports = isAdmin;
