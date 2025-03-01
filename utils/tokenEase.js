const tokenEase = (ourUser, statusCode, res) => {
    
    const token = ourUser.getJWTTOKEN();

    // Option for cookie
    const options = {
        expire: new Date(
            Date.now + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        ourUser,
        token
    })
};

module.exports= tokenEase;