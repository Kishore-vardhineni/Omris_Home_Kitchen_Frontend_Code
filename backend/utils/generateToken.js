import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token (JWT) for a user
 * @param {string} userId - The user's Mongoose ObjectId
 * @returns {string} - Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_key_omris_kitchen',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

/**
 * Sets JWT token in HTTP-Only Cookie (Optional production option)
 * @param {object} res - Express response object
 * @param {string} token - Signed JWT token
 */
export const setTokenCookie = (res, token) => {
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, options);
};
