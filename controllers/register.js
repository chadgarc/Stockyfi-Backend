import { User } from "../models/User.js";
import { validRoles, ROLES, canCreateUser } from "../utils/roles.js";
// for validRoles array: owner: 0, manager: 1, associate: 2
export const register = async (req, res) => {
    try{
        // get user info from request, userRole and userStoreId are for the current user
        const {name, email, password, role, storeId} = req.body;
        
        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === ROLES.OWNER ? null : req.user.storeId.toString();

        // validate data
        if(!name || !email || !password) return res.status(400).json({message: 'Email and password required'});

        // check if user already exists
        const user = await User.findOne({email});
        if(user) return res.status(400).json({message: 'User already exists'});

        // validate role
        if(!validRoles.includes(role)) return res.status(400).json({message: 'Invalid role'});

        // validate current user role and storeId - uses shared matrix (owner anything, manager own store)
        if(!canCreateUser(req.user, role, storeId)) return res.status(403).json({message: 'Not authorized to create new users'});

        // create new user
        const newUser = await User.create({
            name,
            email,
            password,
            role,
            storeId,
        });

        res.status(201).json({message: `User ${newUser.name} created successfully`});
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to register new user'});
    }
}
