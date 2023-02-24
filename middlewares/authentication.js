//jshint esversion: 8

const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log(token);
        jwt.verify(token, "Password", (err, user) => {
            console.log(err);
            if (err) {
                return res.status(403).send({
                    message: "Session expired",
                });
            }
            console.log("authenticate user", user);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = authenticateJWT;