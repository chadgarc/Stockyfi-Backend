import { Router } from "express";
import { createStore } from "../controllers/store.js";
import { protect } from "../middleware/auth.js";
import { getStores } from "../controllers/store.js";
import jurisdiction from "../middleware/jurisdiction.js";
import { createItem, updateItem, getItem, getItems, deleteItem} from "../controllers/items.js";

const router = Router();

router.post('/', protect, createStore);
router.get('/', protect, getStores);

// Nested routes for items
router.post('/:storeId/items', protect, jurisdiction, createItem);
router.put('/:storeId/items/:itemId', protect, jurisdiction, updateItem);
router.get('/:storeId/items/:itemId', protect, jurisdiction, getItem);
router.get('/:storeId/items', protect, jurisdiction, getItems);
router.delete('/:storeId/items/:itemId', protect, jurisdiction, deleteItem);
router.delete('/:storeId/items', protect, jurisdiction, deleteItem);

export default router;