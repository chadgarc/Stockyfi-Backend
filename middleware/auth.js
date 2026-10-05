import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE || '2h'})
}

// Protect routes middleware
const protect = async (req, res, next) => {
    try{
        let token;

        // Extract token from header
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Verify token is valid
        if(!token) {
            return res.status(401).json({message: 'Not authorized, no token'});
        }

        // Decode token and attach user to request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        // If user is not found, return unauthorized
        if(!req.user){
            return res.status(401).json({message: 'Not authorized, user not found'});
        }

        // Pass to the next handler
        next();
    }
    catch (error){
        console.error('Error in auth middleware:', error);
        res.status(401).json({message: 'Not authorized, token failed'});
    }
}

export { generateToken, protect };