//jshint esversion :10
const express = require('express');
const router = express.Router();
var bip39 = require('bip39');
const Web3 = require('web3');
const Jade = require('../build/contracts/Jade.json');
const HDWalletProvider = require("@truffle/hdwallet-provider");

const users = [];

const init = async () =>{
    const web3 = new Web3('http://localhost:7545');
    const id = await web3.eth.net.getId();
    const deployedNetwork = Jade.networks[id];
    const contract = new web3.eth.Contract(Jade.abi,deployedNetwork.address);
     const addresses = await web3.eth.getAccounts();
     return {contract, addresses};
    };

 init();

router.post('/register', (req, res) => {
     let isUserexists = users.findIndex((user) => user.username === req.body.username);
    if (isUserexists === -1) {
     const mnemonic = bip39.generateMnemonic();
     console.log(mnemonic);
     var data = req.body;
     data.mnemonic = mnemonic;
        users.push(data);
        res.send({
            message: "Registered successfully",
            data
        });
    } else {
        res.send({
            message: "User already exists"
        });
    }
});

router.post('/mint', async (req, res) =>{
    let key = await init();
     console.log(key.addresses[1], 'data');
    await key.contract.methods.mint(provider.addresses[0],50).send({
        from :key.addresses[0],  
   }); 
   res.send({
    message : "minted"
});
});

router.get('/balance/:address', async (req, res) => {
    let key = await init();
    console.log(req.params.address);
    const result = await key.contract.methods.balanceOf(req.params.address).call();
    console.log(result);

    res.send({
        value : result
    }); 
    });

router.post('/transfer', async(req, res)=>{
    let key = await init();
try{
    await key.contract.methods.transfer(req.body.toAddress,req.body.amount).send({
    from:req.body.fromAddress,
});
res.send({
    message: "Token Transferred Successfully"
});
}catch{
      res.send({
          message: "Transaction failed"
      });
  }
});

router.get('/public', (req, res) => {
        let provider = new HDWalletProvider({
          privatekey,
            providerOrUrl: "http://localhost:7545",
            });
        console.log(provider.getAddress());
        res.send({
        address:provider.getAddress()
        });

});
module.exports = router;
