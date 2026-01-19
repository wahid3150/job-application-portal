exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // protect middleware already attached req.user
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    next();
  };
};
