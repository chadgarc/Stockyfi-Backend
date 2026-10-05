// This is to manage access for managers and associates to their specific stores
// Only owner should have access to all stores
// protect is not enough because it only checks who the user is but not the store they're accessing

const jurisdiction = (req, res, next) => {
    // req.user comes from the protect middleware
    if(!req.user) return res.status(401).json({message:'Not authorized'});

    // owner has access to all stores (storeId is null)
    if(req.user.role === 'owner') return next();

    // managers and associates can only access their own store (storeId is not null)
    if(!req.user.storeId) return res.status(403).json({message:'No store assigned'});

    // if the storeId in the token does not match the storeId in the request, return 403 forbidden
    if(req.user.storeId.toString() !== req.params.storeId) return res.status(403).json({message:'Forbidden store'});
    
    next();
}

export default jurisdiction;