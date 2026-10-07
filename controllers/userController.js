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
        if(isOwner(targetUser) && ownersUsers <= 1) return res.status(403).json({message: 'Not authorized to delete the only owner'});

        await targetUser.deleteOne();

        res.status(200).json({message: 'User deleted successfully'});
    } catch(error){
        console.error(error);
        res.status(400).json({message: 'Failed to delete user'});
    }
}

export const getUsers = async (req, res) => {
    try{
        // storeId can come from /stores/:storeId/users (params), ?storeId=, or token
        const storeId = req.params.storeId ?? req.query.storeId ?? null;
        const user = req.user;

        // validate user role
        if(!validRoles.includes(user.role.toString())) return res.status(400).json({message: 'Invalid role'});

        // associates cannot list staff
        if(!isOwner(user) && !isManager(user)) return res.status(403).json({message: 'Not authorized to get users'});

        // manager scoped to own store
        if(isManager(user) && storeId && !sameStore(user.storeId, storeId)) return res.status(403).json({message: 'Not authorized to get users from this store'});

        // owner without storeId sees all; otherwise filter (manager defaults to own store)
        const filter = {};
        if(storeId) filter.storeId = storeId;
        else if(isManager(user)) filter.storeId = user.storeId;

        // get users (never passwords)
        const users = await User.find(filter).select('name email storeId role');

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

        // check if user is authorized to get user
        if(!isOwner(user) && !isManager(user)) return res.status(403).json({message: 'Not authorized to get user'});

        // get user (never password)
        const targetUser = await User.findById(userId).select('-password');

        // check if user exists
        if(!targetUser) return res.status(404).json({message: 'User not found'});

        // if scoped by store param, enforce match; managers always scoped to own store
        if(storeId && !sameStore(targetUser.storeId ?? storeId, storeId)) return res.status(404).json({message: 'User not found in this store'});
        
        // manager scoped to own store
        if(isManager(user) && !sameStore(targetUser.storeId, user.storeId) && !isOwner(targetUser)) return res.status(403).json({message: 'Not authorized to get user'});

        // NOTE: single response — shape is {_id, name, email, role, storeId} (password never sent).
        res.status(200).json(targetUser);
    } catch(error){
        console.error(error);
        res.status(400).json({message: 'Failed to get user'});
    }
}

export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        const { name, email, password, role, storeId } = req.body;

        // only owner|manager can update staff (associate blocked)
        if (!isOwner(currentUser) && !isManager(currentUser)) return res.status(403).json({ message: 'Not authorized to update users' });

        // get target
        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // manager can never touch an owner (target has null storeId, guard first)
        if (isManagerActingOnOwner(currentUser, targetUser)) return res.status(403).json({ message: 'Managers cannot update owners' });

        // manager scoped to own store (target + requested store)
        if (isManager(currentUser)) {
            if (!sameStore(targetUser.storeId, currentUser.storeId)) return res.status(403).json({ message: 'Not authorized to update users in this store' });
            if (storeId && !sameStore(storeId, currentUser.storeId)) return res.status(403).json({ message: 'Cannot move users to another store' });
            if (role && role !== targetUser.role && ![ROLES.MANAGER, ROLES.ASSOCIATE].includes(role)) return res.status(403).json({ message: 'Managers can only set manager|associate' });
        }

        // last-owner protection: cannot delete-role the only owner
        if (isOwner(targetUser) && role && role !== ROLES.OWNER) {
            const ownersCount = await User.countDocuments({ role: ROLES.OWNER });
            if (ownersCount <= 1) return res.status(403).json({ message: 'Cannot change role of the only owner' });
        }

        // NOTE (save vs findByIdAndUpdate):
        // runValidators only checks schema shape (required/enum/min/custom validate).
        // It does NOT run pre('save'): bcrypt hash, storeId=null for owner, Store.exists check.
        // So here we mutate + save() to trigger hashing. Items can use
        // findByIdAndUpdate+runValidators (no hashing there).
        // apply allowed fields (password hashes via pre-save: use save, not findByIdAndUpdate)
        if (name !== undefined) targetUser.name = name;
        if (email !== undefined) targetUser.email = email;
        if (password !== undefined) targetUser.password = password;

        // only owner can change role/storeId freely; manager already constrained above
        if (role !== undefined && (isOwner(currentUser))) targetUser.role = role;
        else if (role !== undefined && isManager(currentUser) && [ROLES.MANAGER, ROLES.ASSOCIATE].includes(role)) targetUser.role = role;
        
        if (storeId !== undefined && isOwner(currentUser)) targetUser.storeId = storeId;
        else if (storeId !== undefined && isManager(currentUser) && sameStore(storeId, currentUser.storeId)) targetUser.storeId = storeId;

        await targetUser.save();
        const safe = await User.findById(targetUser._id).select('-password');
        res.status(200).json(safe);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to update user' });
    }
};

/**
 * GET /api/users/me — own profile (name, email, role, storeId). Never password.
 */
export const getMe = async (req, res) => {
    try {
        const me = await User.findById(req.user._id).select('name email role storeId');

        if (!me) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(me);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to get profile' });
    }
};

/**
 * PUT /api/users/me — update own name/email/password only.
 * role/storeId in body are ignored. Changing password requires currentPassword.
 */
export const updateMe = async (req, res) => {
    try {
        const me = await User.findById(req.user._id);

        if (!me) return res.status(404).json({ message: 'User not found' });

        const { name, email, currentPassword, newPassword } = req.body;

        if (newPassword) {
            if (!currentPassword) return res.status(400).json({ message: 'currentPassword required' });
            if (!(await me.comparePassword(currentPassword))) return res.status(401).json({ message: 'Invalid password' });
            me.password = newPassword;
        }

        if (name !== undefined) me.name = name;
        if (email !== undefined) me.email = email;
        
        await me.save();

        const safe = await User.findById(me._id).select('name email role storeId');

        res.status(200).json(safe);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to update profile' });
    }
};

/**
 * Owner-admin owners endpoint.
 * NOTE: owners are created only via register (single source of truth).
 * This helper is kept for backwards compat but delegates to the same rules:
 * use POST /api/users/owners route which forces role=owner via register.
 * Only owner; last-owner protection applies on update/delete.
 */
export const createOwner = async (req, res) => {
    req.body.role = ROLES.OWNER;
    req.body.storeId = null;
    const { register } = await import('./register.js');
    return register(req, res);
};