import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123_abc_xyz';

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the JWT
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user details to request object
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
      };

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token validation failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no authorization token provided'));
  }
};
