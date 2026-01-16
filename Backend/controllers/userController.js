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

exports.updateMyProfile = async (req, res) => {
  try {
    const user = req.user; //from protect middleware
    const { name, companyName, companyDescription } = req.body;

    // 1 allowed updates only
    if (name !== undefined) user.name = name;
    // 2 role-based updates
    if (user.role === "employer") {
      if (companyName !== undefined) user.companyName = companyName;
      if (companyDescription !== undefined)
        user.companyDescription = companyDescription;
    }

    // jobseeker cannot update company fields
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
