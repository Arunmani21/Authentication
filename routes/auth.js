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

 function mnemonicToKeyPair(mnemonic, derivationPath, password) {
    const seed = bip39.mnemonicToSeedSync(mnemonic,derivationPath, password);
    const { privateKey, publicKey } = hdkey
      .fromMasterSeed(seed)
      .derive(derivationPath);
    return { privateKey, publicKey };
  }
  
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

// router.get('/private', (req, res) => {
//     let userexists = users.find((user) => user.mnemonic === req.body.mnemonic);
//     if(userexists){
//         let pair =  mnemonicToKeyPair( userexists.mnemonic,"m/44'/60'/0'/0",
//     "1234");
//     console.log(pair.privateKey);
//     res.send({
//         privateKey: pair.privateKey.toString('hex'),
//         user: userexists
//     });    
//     } else{
//         res.send({
//             message: "mnemonic Key is not valid",
//             users
//         });
//     } 
// });
// router.post('/public', (req, res) => {
//     console.log(req.body.privateKey, req.body.username);
//     let provider = new HDWalletProvider(
//    req.body.privateKey,"http://localhost:7545");
//     console.log(provider.getAddress());
//  let cuser = users.find( s =>{
//         return s.username == req.body.username;
//     });
//     cuser.address = provider.getAddress();
//     console.log(users);
//     res.send({
//     address:provider.getAddress(),
//     user: cuser
    
//     });

// });

// router.post("/login", (req, res) => {
//     console.log(users);
//     let loggedin = users.findIndex((user) => user.username === req.body.username && user.password === req.body.password);
//     console.log({loggedin}, users[0]);
//     if (loggedin > -1) {
//         let token = jwt.sign(
//             { username: req.body.username , address:users[0].address},
//             "blockchain",
//             { expiresIn: "1h" }
//         );
//         res.send({
//             message: "loggedin successfully",
//             token
//         });
//     } else {
//         res.status(401).send({
//             message: "unsuccess"
//         });
//     }

// });

// const authenticateJWT = (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (authHeader) {
//         jwt.verify(authHeader, "blockchain", (err, user) => {
//             if (err) {
//                 return res.sendStatus(403);
//             }

//             req.user = user;
//             next();
//         });
//     } else {
//         res.sendStatus(401);
//     }
// };
// router.post('/mint',authenticateJWT,  async (req, res) =>{
//     let key = await init();
//      console.log( 'data', req.user);
//     await key.contract.methods.mint(req.user.address,50).send({
//         from :key.addresses[0],  
//    }); 
//    res.send({
//     message : "minted"
// });
// }); 

// router.get('/balance/:address', async (req, res) => {
//     let key = await init();
//     const result = await key.contract.methods.balanceOf(req.params.address).call();
//     console.log(req.params.address,result);
//     res.send({
//         value : result
//     }); 
// });

// router.post('/transfer',authenticateJWT, async(req, res)=> {
//     let key = await init();
//     const receipt =  await key.contract.methods.transfer("",50).send({
//         from : addresses[1],
//     });
// });

 module.exports = router;
