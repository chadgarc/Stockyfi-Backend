import Store from "../models/Store.js";
import { User } from "../models/User.js";
import { ROLES, isOwner, isManager, sameStore, canCreateStore, canDeleteStore, canReadStore } from "../utils/roles.js";
import Item from "../models/Item.js";


export const createStore = async (req, res) => {
    try{
        const {name, streetAddress, city, state, zip} = req.body;

        // validate store data
        if(!name || !streetAddress || !city || !state || !zip) return res.status(400).json({message: 'All fields required'});

        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();

        // validate current user role, only owner can create stores
        if(!canCreateStore(req.user)) return res.status(403).json({message: 'Not authorized to create new stores'});
        
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
        const user = req.user;
        const userStoreId = req.user.role === ROLES.OWNER ? null : req.user.storeId.toString();

        // validate current user role and storeId - owner or manager can get all stores, manager can only get their own store
        if(!isOwner(user)){
            // Manager will get their store only
            if(isManager(user)){
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

export const deleteStore = async (req, res) => {
    try{
        const user = req.user;
        const {storeId} = req.params;

        // get store
        const store = await Store.findById(storeId);
        
        // validate storeId
        if(!store) return res.status(404).json({message: 'Store not found'});

        // validate current user role - only owner can delete stores
        if(!canDeleteStore(user)) return res.status(403).json({message: 'Not authorized to delete stores'});
        
        // delete items from store
        await Item.deleteMany({storeId: storeId});

        // delete staff from store
        await User.deleteMany({storeId: storeId});
        
        // delete store
        await store.deleteOne();

        // verify store was deleted
        res.status(200).json({message: 'Store deleted successfully'});
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Failed to delete store'});
    }
}

export const updateStore = async (req, res) => {
    try{
        const user = req.user;
        const {storeId} = req.params;
        const {name, streetAddress, city, state, zip} = req.body;

        // validate store data
        if(!name || !streetAddress || !city || !state || !zip) return res.status(400).json({message: 'All fields required'});

        // get store
        const store = await Store.findById(storeId);
        
        // validate storeId
        if(!store) return res.status(404).json({message: 'Store not found'});

        // validate current user role - only owner can update stores
        if(!isOwner(user)) return res.status(403).json({message: 'Not authorized to update stores'});
        
        // update
        await store.updateOne({name, streetAddress, city, state, zip});

        // verify store was updated
        res.status(200).json({message: 'Store updated successfully'});
    } catch(error){
        console.error(error);
        res.status(500).json({message: 'Failed to update store'});
    }
}