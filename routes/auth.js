//jshint esversion :8
const express = require('express');
const router = express.Router();
const hdkey = require('hdkey');
var bip39 = require('bip39');
const Web3 = require('web3');
const Jade = require('../build/contracts/Jade.json');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const jwt = require("jsonwebtoken");
const users = require("../model");

let web3;
const init = async () =>{
     web3 = new Web3('http://localhost:7545');
    const id = await web3.eth.net.getId();
    const deployedNetwork = Jade.networks[id];
    const contract = new web3.eth.Contract(Jade.abi,deployedNetwork.address);
     const addresses = await web3.eth.getAccounts();
     return {contract, addresses};
    };
 init();

router.post('/register', (req, res) => {
     let isUserexists = users.findOne({username: req.body.username});
    if (isUserexists) {
    const mnemonic = bip39.generateMnemonic();
     console.log(mnemonic);
    const user = new users({
        username: req.body.username,
        password: req.body.password,
        mnemonic: mnemonic
    });
    user.save();
        res.send({
            message: "Registered successfully",
            user
        });
    } else {
        res.send({
            message: "User already exists"
        });
    }
});

router.post("/login", (req, res) => {
    console.log(users);
    let loggedin = users.findIndex((user) => user.username === req.body.username && user.password === req.body.password);
    console.log({loggedin}, users[0]);
    if (loggedin > -1) {
        let token = jwt.sign(
            { username: req.body.username , address:users[0].address},
            "blockchain",
            { expiresIn: "1h" }
        );
        res.send({
            message: "loggedin successfully",
            token
        });
    } else {
        res.status(401).send({
            message: "unsuccess"
        });
    }

});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        jwt.verify(authHeader, "blockchain", (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};





 module.exports = router;
