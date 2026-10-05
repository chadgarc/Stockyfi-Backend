
export const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        // validate data
        if(!email || !password) return res.status(400).json({message: 'Email and password required'});

        // check if user exists and if password matches
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message: 'Invalid credentials'});

        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(401).json({message: 'Invalid credentials'});

        // generate token
        const token = generateToken(user._id);
        res.status(200).json({token});
    }
    catch (error){
        console.error('Error in login middleware:', error);
        res.status(500).json({message: 'Failed to login'});
    }
}