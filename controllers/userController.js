import { User, validRoles } from "../models/User.js";
import Store from "../models/Store.js";

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, storeId } = req.body;
        
        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === validRoles[0] ? null : req.user.storeId.toString();
        
        // validate data
        if(!name || !email || !password || !role || !storeId) return res.status(400).json({message: 'All fields required'});

        // validate user role
        if(!validRoles.includes(role)) return res.status(400).json({message: 'Invalid role'});

        // validate current user role
        if(req.user.role !== validRoles[0] && req.user.role !== validRoles[1]) return res.status(403).json({message: 'Not authorized to create users'});

        // validate manager
        if(req.user.role === validRoles[1] && storeId !== userStoreId) return res.status(403).json({message: 'Not authorized to create users in this store'});

        // check if user already exists
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message: 'User already exists'});

        // create user
        const newUser = await User.create({name, email, password, role, storeId});

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({message: 'Failed to create user'});
    }
}

export const deleteUser = async (req, res) => {
    try{
        const userRole = req.user.role.toString();
        const {userId} = req.params;
        
        // get user
        const user = await User.findById(userId);

        // check if user exists
        if(!user) return res.status(404).json({message: 'User not found'});
        
        // validate user role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});
        
        // only owner and manager can delete users
        if(userRole !== validRoles[0] && userRole !== validRoles[1]) return res.status(403).json({message: 'Not authorized to delete users'});

        // manager cannot delete users in a different store
        if(userRole === validRoles[1] && user.storeId.toString() !== req.user.storeId.toString()) return res.status(403).json({message: 'Not authorized to delete users in this store'});
        
        // if user to be deleted is owner, prevent it. at least 1 owner must exist in business
        const ownersUsers = await User.countDocuments({role: validRoles[0]});
        if(user.role.toString() === validRoles[0] && ownersUsers <= 1) return res.status(403).json({message: 'Not authorized to delete the only owner'});

        await user.deleteOne();

        res.status(200).json({message: 'User deleted successfully'});
    } catch(error){
        console.error(error);
        res.status(400).json({message: 'Failed to delete user'});
    }
}

export const getUsers = async (req, res) => {
    try{
        
    } catch(error){
        console.error(error);
        res.status(400).json({message: 'Failed to get users'});
    }
}

export const updateUser = async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(400).json({message: 'Failed to update user'});
    }
}