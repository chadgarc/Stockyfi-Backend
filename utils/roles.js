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
