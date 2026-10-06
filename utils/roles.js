/**
 * Shared role constants + helpers.
 * User.js imports from this file; controllers import from this file.
 */

/** Role names **/
export const ROLES = Object.freeze({
    OWNER: 'owner',
    MANAGER: 'manager',
    ASSOCIATE: 'associate',
});

/** Array for Mongoose enum validation. */
export const validRoles = Object.values(ROLES);

/** True if user has owner role. */
export const isOwner = (user) => user?.role?.toString() === ROLES.OWNER;

/** True if user has manager role. */
export const isManager = (user) => user?.role?.toString() === ROLES.MANAGER;

/** True if user has associate role. */
export const isAssociate = (user) => user?.role?.toString() === ROLES.ASSOCIATE;

/** True if two store ids match (safe for ObjectId, string, null). */
export const sameStore = (idA, idB) => idA?.toString() === idB?.toString();

/** True if a manager tries to act on an owner (always forbidden). */
export const isManagerActingOnOwner = (currentUser, targetUser) =>
    isManager(currentUser) && isOwner(targetUser);

/** Only owner: stores and business. */
export const canCreateStore = (user) => isOwner(user);
export const canDeleteStore = (user) => isOwner(user);
export const canManageBusiness = (user) => isOwner(user);

/** Users: owner anything, manager only manager|associate in own store (uses ROLES, no raw strings). */
export const canCreateUser = (currentUser, newRole, targetStoreId) => {
    if (isOwner(currentUser)) return true;
    if (!isManager(currentUser)) return false;
    if (![ROLES.MANAGER, ROLES.ASSOCIATE].includes(newRole)) return false;
    return sameStore(currentUser?.storeId, targetStoreId);
};

export const canDeleteUser = (currentUser, targetUser) => {
    if (isAssociate(currentUser)) return false;
    if (isManagerActingOnOwner(currentUser, targetUser)) return false;
    if (isOwner(currentUser)) return true;
    return sameStore(currentUser?.storeId, targetUser?.storeId);
};

/** Items: create/delete owner|manager; read own store; associate updates stock fields only. */
export const canCreateItem = (user) => isOwner(user) || isManager(user);
export const canDeleteItem = (user) => isOwner(user) || isManager(user);
export const canReadStore = (user, storeId) =>
    isOwner(user) || sameStore(user?.storeId, storeId);
export const canUpdateItemField = (user, field) => {
    if (isOwner(user) || isManager(user)) return true;
    return ['inStock', 'inShelf'].includes(field);
};
