import Item from "../models/Item.js";
import { validRoles } from "../models/User.js";

export const createItem = async(req, res) => {
    try{
        const {name, upc, storeId, inStock, inShelf, department = 'any'} = req.body;

        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === validRoles[0] ? null : req.user.storeId.toString();

        // validate data
        if(!name || !upc || !storeId || inShelf > inStock) return res.status(400).json({message: 'All fields required or invalid values'});

        // check if item already exists, it can use id or upc
        const item = await Item.findOne({upc, storeId});
        if(item) return res.status(400).json({message: 'Item already exists'});

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});

        // validate current user role and storeId - manager or owner can create a new item
        if(userRole !== validRoles[1] && userRole !== validRoles[0]) return res.status(403).json({message: 'Not authorized to create new items'});
        
        // manager cannot create items in a different store
        if(userRole === validRoles[1] && userStoreId !== storeId) return res.status(403).json({message: 'Not authorized to create items in this store'});

        // create new item
        const newItem = await Item.create({
            name,
            upc,
            storeId,
            inStock,
            inShelf,
            department,
        });

        res.status(201).json({message: `Item ${newItem.name} created successfully`});
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to create new item'});
    }
}

export const updateItem = async(req, res) => {
    try{
        const {name, upc, storeId, inStock, inShelf, department} = req.body;
        const {itemId} = req.params;

        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === validRoles[0] ? null : req.user.storeId.toString();

        // validate data
        if(!name || !upc || !storeId || inShelf > inStock) return res.status(400).json({message: 'All fields required or invalid values'});

        // check if item already exists, it can use id or upc
        const item = await Item.findOne({upc, storeId});
        if(!item) return res.status(400).json({message: 'Item not found'});

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});
        
        // employees cannot change items in a different store
        if( userStoreId !== storeId && userRole !== validRoles[0] ) return res.status(403).json({message: 'Not authorized to change items in this store'});

        // associates can only change inStock and inShelf value
        if(userRole === validRoles[2] && (name !== item.name || upc !== item.upc || department !== item.department)) return res.status(403).json({message: 'Not authorized to change item information'});

        // update item
        const updatedItem = await Item.findByIdAndUpdate(itemId, {
            name,
            upc,
            storeId,
            inStock,
            inShelf,
            department,
        }, { new: true, runValidators: true });

        res.status(201).json({message: `Item ${updatedItem.name} updated successfully`});
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to update item'});
    }
}

export const getItem = async(req, res) => {
    try{
        const {storeId, itemId} = req.params;

        // all roles can gather items from their assigned store, owner can gather from all stores
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === validRoles[0] ? null : req.user.storeId.toString();

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});

        // employees cannot get items from a different store, but the owner can get items from all stores
        if( userStoreId !== storeId && userRole !== validRoles[0] ) return res.status(403).json({message: 'Not authorized to get items from this store'});

        // get item
        const item = await Item.findById(itemId);

        if(!item) return res.status(404).json({message: 'Item not found'});
        
        res.status(200).json(item);
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to get item'});
    }
}

export const getItems = async(req, res) => {
    try{
        const {storeId} = req.params;

        // all roles can gather items from their assigned store, owner can gather from all stores
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === validRoles[0] ? null : req.user.storeId.toString();

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});

        // employees cannot get items from a different store, but the owner can get items from all stores
        if( userStoreId !== storeId && userRole !== validRoles[0] ) return res.status(403).json({message: 'Not authorized to get items from this store'});

        // get items
        const items = await Item.find({storeId});
        res.status(200).json(items);
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to get items'});
    }
}
