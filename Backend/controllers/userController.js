exports.getMyProfile = async (req, res) => {
  try {
    // protect middleware already attached the user
    const user = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        //Optional profile fields
        avatar: user.avatar || null,
        resume: user.resume || null,

        //employer specific
        companyName: user.companyName || null,
        companyDescription: user.companyDescription || null,
        companyLogo: user.companyLogo || null,
      },
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
