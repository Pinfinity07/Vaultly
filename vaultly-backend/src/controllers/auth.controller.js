const authService = require('../services/auth.service');

function safeUser(user){
    if(!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
}

const REFRESH_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const ACCESS_COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
};

async function signup(req,res) {
    try{
        const { full_name, email, password } = req.body;
        if(!full_name || !email || !password){
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingUser = await authService.findUserByEmail(email);
        if(existingUser){
            return res.status(409).json({ error: "User with this email already exists" });
        }

        const passwordHash = await authService.hashPassword(password);
        const newUser = await authService.createUser({ full_name, email, passwordHash, role: 'user' });
        const safeNewUser = safeUser(newUser);

        const accessToken = authService.generateAccessToken({ userId: newUser.id, role: newUser.role });
        const refreshToken = authService.generateRefreshToken({ userId: newUser.id, role: newUser.role });

        res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTS);
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTS);

        return res.status(201).json({ user: safeNewUser });
    }catch(err){
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function login(req,res){
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ error: "Missing email or password" });
        }

        const user = await authService.findUserByEmail(email);
        if(!user){
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const passwordMatch = await authService.comparePassword(password, user.passwordHash);
        if(!passwordMatch){
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const safeUserData = safeUser(user);
        const accessToken = authService.generateAccessToken({ userId: user.id, role: user.role });
        const refreshToken = authService.generateRefreshToken({ userId: user.id, role: user.role });

        res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTS);
        res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTS);

        return res.status(200).json({ user: safeUserData });
    }catch(err){
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function refreshToken(req, res) {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ error: "Refresh token missing" });
        }

        const payload = authService.verifyRefreshToken(token);
        if (!payload || !payload.userId) {
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }

        const user = await authService.findUserById(payload.userId);
        if (!user) {
            return res.status(401).json({ error: "User no longer exists" });
        }

        const newAccessToken = authService.generateAccessToken({ userId: user.id, role: user.role });
        const newRefreshToken = authService.generateRefreshToken({ userId: user.id, role: user.role });

        res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTS);
        res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTS);

        return res.status(200).json({ success: true, user: safeUser(user) });
    } catch (err) {
        console.error("Refresh token error:", err);
        return res.status(500).json({ error: "Failed to refresh token" });
    }
}

async function logout(req,res){
    res.clearCookie("accessToken", ACCESS_COOKIE_OPTS);
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTS);
    return res.status(200).json({ message: "Logged out successfully" });
}

async function ifLoggedIn(req,res){
    const userId = req.userId;
    if(!userId){
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await authService.findUserById(userId);
    if(!user){
        return res.status(401).json({ error: "Unauthorized" });
    }else{
        return res.status(200).json({ user: safeUser(user) });
    }
}

module.exports = {
    signup,
    login,
    refreshToken,
    logout,
    ifLoggedIn
};