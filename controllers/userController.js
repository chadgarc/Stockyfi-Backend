import { User } from "../models/User.js";
import { validRoles, ROLES, isOwner, isManager, sameStore, isManagerActingOnOwner } from "../utils/roles.js";
import Store from "../models/Store.js";

// (helpers now live in ../utils/roles.js with descriptive names)

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, storeId } = req.body;
        
        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = isOwner(req.user) ? null : req.user.storeId?.toString();
        
        // validate data
        if(!name || !email || !password || !role || !storeId) return res.status(400).json({message: 'All fields required'});

        // validate user role
        if(!validRoles.includes(role)) return res.status(400).json({message: 'Invalid role'});

        // validate current user role
        if(!isOwner(req.user) && userRole !== ROLES.MANAGER) return res.status(403).json({message: 'Not authorized to create users'});

        // validate manager
        if(userRole === ROLES.MANAGER && !sameStore(storeId, userStoreId)) return res.status(403).json({message: 'Not authorized to create users in this store'});

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
        const user = req.user;
        const {userId} = req.params;
        
        // get user
        const targetUser = await User.findById(userId);

        // check if user exists
        if(!targetUser) return res.status(404).json({message: 'User not found'});
        
        // validate user role
        if(!validRoles.includes(targetUser.role.toString())) return res.status(400).json({message: 'Invalid role'});
        
        // only owner and manager can delete users
        if(!isOwner(user) && !isManager(user)) return res.status(403).json({message: 'Not authorized to delete users'});

        // manager cannot act on owners (owner storeId is null, guard first to avoid crash)
        if(isManagerActingOnOwner(user, targetUser)) return res.status(403).json({message: 'Managers cannot delete owners'});

        // manager cannot delete users in a different store
        if(isManager(user) && !sameStore(user.storeId, targetUser.storeId)) return res.status(403).json({message: 'Not authorized to delete users in this store'});
        
        // if user to be deleted is owner, prevent it. at least 1 owner must exist in business
        const ownersUsers = await User.countDocuments({role: ROLES.OWNER});
        if(isOwner(user) && ownersUsers <= 1) return res.status(403).json({message: 'Not authorized to delete the only owner'});

        await user.deleteOne();

        res.status(200).json({message: 'User deleted successfully'});
    } catch(error){
        console.error(error);
        res.status(400).json({message: 'Failed to delete user'});
    }
}

export const getUsers = async (req, res) => {
    try{
        const {storeId} = req.params;
        const user = req.user;

        // validate user role
        if(!validRoles.includes(user.role.toString())) return res.status(400).json({message: 'Invalid role'});
        
        // manager cannot get users from a different store or associates cannot get any users
        if((isManager(user) && !sameStore(user.storeId, storeId)) ||
        (!isOwner(user) && !isManager(user)))
            return res.status(403).json({message: 'Not authorized to get retrieve users'});

        // get user
        const users = await User.find({storeId});

        // check if user exists
        if(!users) return res.status(404).json({message: 'User not found'});

        res.status(200).json(users);
    } catch(error){
        console.error(error);
        res.status(400).json({message: 'Failed to get users'});
    }
}

export const getUser = async (req, res) => {
    try{
        const {storeId, userId} = req.params;
        const user = req.user;

        // validate user role
        if(!validRoles.includes(user.role.toString())) return res.status(400).json({message: 'Invalid role'});
        
        // manager cannot get users from a different store or associates cannot get any users
        if((isManager(user) && !sameStore(user.storeId, storeId)) ||
        (!isOwner(user) && !isManager(user)))
            return res.status(403).json({message: 'Not authorized to get user'});

        // get user
        const targetUser = await User.findById(userId);

        // check if user exists
        if(!targetUser) return res.status(404).json({message: 'User not found'});

        res.status(200).json(targetUser);
    } catch(error){
        console.error(error);
        res.status(400).json({message: 'Failed to get user'});
    }
}

export const updateUser = async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        res.status(400).json({message: 'Failed to update user'});
    }
}