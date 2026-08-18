const jwt = require('jsonwebtoken');

const secretKey = 'glowlistrahasia';

const authJWT = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({
            message: 'Silakan login terlebih dahulu',
        });
    }

    const auth = token.split(' ')[1];

    jwt.verify(auth, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Token tidak valid',
            });
        }

        req.user = user;
        next();
    });
};

module.exports = authJWT;