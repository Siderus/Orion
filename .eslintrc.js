module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": ["equimper","standard"],
    "plugins": ["react"],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};