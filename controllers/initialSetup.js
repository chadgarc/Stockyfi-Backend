import User from "../models/User.js";
import Business from "../models/Business.js";
import { generateToken } from "../middleware/auth.js";

export const setupOwner = async (req,res) => {
    try{
        // Check if there are any owners on file
        const ownersOnFile = await User.countDocuments({ role: 'owner' });
        if(ownersOnFile > 0) return res.status(403).json({message: 'Setup locked, owner and business already exists'});
        
        // if no owners, create an owner and business
        const {name, streetAddress, city, state, zip, ownerName, email, password} = req.body;

        // validate data
        if(!name || !streetAddress || !city || !state || !zip || !ownerName || !email || !password)
            return res.status(400).json({message:'All fields required'});

        const owner = await User.create({
            name: ownerName,
            email,
            password,
            role: 'owner',
            storeId: null,
        });

        const business = await Business.create({
            name,
            streetAddress,
            city,
            state,
            zip,
        });

        // create token
        const token = generateToken(owner._id);
        res.status(201).json({token});
    }
    catch (error){
        console.error('Error in setupOwner middleware:', error);
        res.status(500).json({message: 'Failed to setup owner'});
    }
}