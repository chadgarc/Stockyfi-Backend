import Store from "../models/Store.js";
import { validRoles } from "../models/User.js";

export const createStore = async (req, res) => {
    try{
        const {name, streetAddress, city, state, zip} = req.body;

        // validate store data
        if(!name || !streetAddress || !city || !state || !zip) return res.status(400).json({message: 'All fields required'});

        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();

        // validate current user role , sonly owner can create stores
        if(userRole !== validRoles[0]) return res.status(403).json({message: 'Not authorized to create new stores'});
        
        // create new store
        const store = await Store.create({name, streetAddress, city, state, zip});

        res.status(201).json({message: 'Store created successfully'});
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Failed to create store'});
    }
}

export const getStores = async (req, res) => {
    try{
        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === validRoles[0] ? null : req.user.storeId.toString();

        // validate current user role and storeId - owner or manager can get all stores, manager can only get their own store
        if(userRole !== validRoles[0]){
            // Manager will get their store only
            if(userRole === validRoles[1]){
                return res.status(200).json({message: 'Store found successfully', store: await Store.findById(userStoreId)});
            }
            // Associate will get their store name only
            return res.status(200).json({store: await Store.findById(userStoreId).select("name streetAddress city state zip")});
        } 

        const stores = await Store.find({});
        res.status(200).json(stores);
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Failed to get stores'});
    }
}