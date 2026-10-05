import Business from "../models/Business.js";
import { validRoles } from "../models/User.js";

export const getBusiness = async (req, res) => {
    try {
        // There's only one business, so we can just get the first one
        const business = await Business.findOne();
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // check if user role is valid
        if(!validRoles.includes(req.user.role)) return res.status(400).json({message: 'Invalid role'});

        // only owner can get the business information
        if(req.user.role !== validRoles[0]) return res.status(403).json({message: 'Not authorized to get business information'});
        
        res.status(200).json(business);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get business' });
    }
}

export const updateBusiness = async (req, res) => {
    try {
        const { name, streetAddress, city, state, zip, phone } = req.body;

        // check if user role is valid
        if(!validRoles.includes(req.user.role)) return res.status(400).json({message: 'Invalid role'});

        // only owner can update the business information
        if(req.user.role !== validRoles[0]) return res.status(403).json({message: 'Not authorized to update business information'});

        // {} is to find the first business since we only have one
        const business = await Business.findOneAndUpdate( {},
            { name, streetAddress, city, state, zip, phone },
            { new: true, runValidators: true }
        );
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.status(200).json(business);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update business' });
    }
}