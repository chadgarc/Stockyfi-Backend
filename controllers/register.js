import {User, validRoles} from "../models/User.js";

export const register = async (req, res) => {
    try{
        // get user info from request, userRole and userStoreId are for the current user
        const {name, email, password, role, storeId, userRole, userStoreId} = req.body;
        
        // validate data
        if(!name || !email || !password) return res.status(400).json({message: 'Email and password required'});

        // check if user already exists
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message: 'User already exists'});

        // validate role
        if(!validRoles.includes(role)) return res.status(400).json({message: 'Invalid role'});

        // validate current user role and storeId - manager or owner can create a new user
        if(userRole !== 'manager' && userRole !== 'owner') return res.status(403).json({message: 'Not authorized to create new users'});
        
        // manager cannot create owners, and cannot create users in a different store
        if(userRole === 'manager'){
            if(userStoreId !== storeId) return res.status(403).json({message: 'Not authorized to create users in this store'});
            if(role === 'owner') return res.status(403).json({message: 'Not authorized to create owners'});
        }

        // create new user
        const newUser = await User.create({
            name,
            email,
            password,
            role,
            storeId,
        });

        res.status(201).json(newUser);
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to register new user'});
    }
}
