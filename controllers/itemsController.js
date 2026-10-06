import Item from "../models/Item.js";
import { validRoles, ROLES, isOwner, isManager, sameStore, canCreateItem, canDeleteItem, canReadStore, isAssociate } from "../utils/roles.js";

export const createItem = async(req, res) => {
    try{
        const {name, upc, inStock, inShelf, department = 'any'} = req.body;

        // get storeId from request (from protect middleware)
        const storeId = req.params.storeId;

        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === ROLES.OWNER ? null : req.user.storeId.toString();

        // validate data
        if(!name || !upc || !storeId || inShelf > inStock) return res.status(400).json({message: 'All fields required or invalid values'});

        // check if item already exists, it can use id or upc
        const item = await Item.findOne({upc, storeId});
        if(item) return res.status(400).json({message: 'Item already exists'});

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});

        // validate current user role and storeId - manager or owner can create a new item
        if(!canCreateItem(req.user)) return res.status(403).json({message: 'Not authorized to create new items'});
        
        // manager cannot create items in a different store
        if(isManager(req.user) && !sameStore(userStoreId, storeId)) return res.status(403).json({message: 'Not authorized to create items in this store'});

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
        const {name, upc, inStock, inShelf, department} = req.body;
        const {itemId, storeId} = req.params;

        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === ROLES.OWNER ? null : req.user.storeId.toString();

        // validate data
        if(!name || !upc || !storeId || inShelf > inStock) return res.status(400).json({message: 'All fields required or invalid values'});

        // check if item already exists, it can use id or upc
        const item = await Item.findOne({upc, storeId});
        if(!item) return res.status(400).json({message: 'Item not found'});

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});
        
        // employees cannot change items in a different store
        if(!canReadStore(req.user, storeId)) return res.status(403).json({message: 'Not authorized to change items in this store'});

        // associates can change inStock and inShelf value only
        if(isAssociate(req.user) && (name !== item.name || upc !== item.upc || department !== item.department)) return res.status(403).json({message: 'Not authorized to change item information'});

        // NOTE: items CAN use findByIdAndUpdate+runValidators (numbers only, no hashing).
        // Users must use save() instead (see updateUser) because runValidators
        // does not run pre('save'): bcrypt hash, storeId=null, Store check.
        // update item
        const updatedItem = await Item.findByIdAndUpdate(itemId, {
            name,
            upc,
            storeId,
            inStock,
            inShelf,
            department,
        }, { new: true, runValidators: true });

        res.status(200).json({message: `Item ${updatedItem.name} updated successfully`});
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
        const userStoreId = req.user.role === ROLES.OWNER ? null : req.user.storeId.toString();

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});

        // employees cannot get items from a different store, but the owner can get items from all stores
        if(!canReadStore(req.user, storeId)) return res.status(403).json({message: 'Not authorized to get items from this store'});

        // get item
        const item = await Item.findById(itemId);

        if(!item) return res.status(404).json({message: 'Item not found'});

        // verify item belongs to this store
        if(item.storeId.toString() !== storeId) return res.status(404).json({message: 'Item not found in this store'});

        // if upc query provided, verify it matches
        if(req.query.upc && item.upc !== req.query.upc) return res.status(404).json({message: 'Item UPC mismatch'});
        
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
        const userStoreId = req.user.role === ROLES.OWNER ? null : req.user.storeId.toString();

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});

        // employees cannot get items from a different store, but the owner can get items from all stores
        if(!canReadStore(req.user, storeId)) return res.status(403).json({message: 'Not authorized to get items from this store'});

        // get items - if upc query provided, return single match
        if(req.query.upc){
            const single = await Item.findOne({storeId, upc: req.query.upc});
            if(!single) return res.status(404).json({message: 'Item not found'});
            return res.status(200).json(single);
        }

        const items = await Item.find({storeId});
        res.status(200).json(items);
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to get items'});
    }
}

/**
 * DELETE /api/stores/:storeId/items/:itemId | DELETE /api/stores/:storeId/items?upc= | ?all=true
 * - Por :itemId: borra 1 por _id (verifica que pertenezca a :storeId).
 * - Por ?upc=: borra 1 por UPC dentro de :storeId (índice compuesto {storeId,upc}).
 * - Por ?all=true: borra todos los items de :storeId (cascada para deleteStore).
 * Solo owner|manager. Requiere protect+jurisdiction.
 */
export const deleteItem = async (req, res) => {
    try{
        const {storeId, itemId} = req.params;

        // get user role and storeId from request (from protect middleware)
        const userRole = req.user.role.toString();
        const userStoreId = req.user.role === ROLES.OWNER ? null : req.user.storeId.toString();

        // validate role
        if(!validRoles.includes(userRole)) return res.status(400).json({message: 'Invalid role'});

        // only owner|manager can delete
        if(!canDeleteItem(req.user)) return res.status(403).json({message: 'Not authorized to delete items'});

        // employees cannot delete items from a different store, but the owner can delete items from all stores
        if(!canReadStore(req.user, storeId)) return res.status(403).json({message: 'Not authorized to delete items from this store'});

        // delete by upc query: DELETE /:storeId/items?upc=123
        if(req.query.upc){
            const byUpc = await Item.findOneAndDelete({storeId, upc: req.query.upc});
            if(!byUpc) return res.status(404).json({message: 'Item not found'});
            return res.status(200).json({message: `Item ${byUpc.name} deleted successfully`});
        }

        // delete all: DELETE /:storeId/items?all=true (cascada)
        if(req.query.all === 'true'){
            const deletedItems = await Item.deleteMany({storeId});
            return res.status(200).json({message: `Deleted ${deletedItems.deletedCount} items from store ${storeId}`});
        }

        // without itemId or query, nothing to delete
        if(!itemId) return res.status(400).json({message: 'Provide itemId, ?upc= or ?all=true'});

        // delete item by id
        const deletedItem = await Item.findById(itemId);

        if(!deletedItem) return res.status(404).json({message: 'Item not found'});

        if(deletedItem.storeId.toString() !== storeId) return res.status(404).json({message: 'Item not found in this store'});

        await deletedItem.deleteOne();

        res.status(200).json({message: `Item ${deletedItem.name} deleted successfully`});
    } catch(error){
        console.error(error)
        res.status(400).json({message: 'Failed to delete item'});
    }
}

/**
 * Helper for cascading deletion (used when deleting a store or all items from that store).
 */
export const deleteItems = async (req, res) => {
    req.query.all = 'true';
    return deleteItem(req, res);
};