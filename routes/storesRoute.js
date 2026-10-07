import { Router } from "express";
import { createStore, getStores, deleteStore, updateStore } from "../controllers/storeController.js";
import { protect } from "../middleware/auth.js";
import jurisdiction from "../middleware/jurisdiction.js";
import { createItem, updateItem, getItem, getItems, deleteItem} from "../controllers/itemsController.js";
import { getUsers, getUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = Router();

router.post('/', protect, createStore);
router.get('/', protect, getStores);
router.put('/:storeId', protect, updateStore);
router.delete('/:storeId', protect, deleteStore);

// Nested routes for items
router.post('/:storeId/items', protect, jurisdiction, createItem);
router.put('/:storeId/items/:itemId', protect, jurisdiction, updateItem);
router.get('/:storeId/items/:itemId', protect, jurisdiction, getItem);
router.get('/:storeId/items', protect, jurisdiction, getItems);
router.delete('/:storeId/items/:itemId', protect, jurisdiction, deleteItem);
router.delete('/:storeId/items', protect, jurisdiction, deleteItem);

// Nested staff routes per store (jurisdiction scopes manager to own store)
router.get('/:storeId/users', protect, jurisdiction, getUsers);
router.get('/:storeId/users/:userId', protect, jurisdiction, getUser);
router.put('/:storeId/users/:userId', protect, jurisdiction, updateUser);
router.delete('/:storeId/users/:userId', protect, jurisdiction, deleteUser);

export default router;