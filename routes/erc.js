//jshint esversion :8
const express = require('express');
const router = express.Router();
const hdkey = require('hdkey');
var bip39 = require('bip39');
const Web3 = require('web3');
const Jade = require('../build/contracts/Jade.json');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const User = require("../model");
const authenticateJWT = require('../middlewares/authentication');
const { RPC_URL, DERIVATION_PATH, MNEMONIC_PASSWORD } = require('../config/config');

const web3 = new Web3('http://localhost:7545');
const init = async () => {
    const id = await web3.eth.net.getId();
    console.log("id", id);
    console.log("kade", Jade.networks);
    const deployedNetwork = Jade.networks[id];
   const contract = new web3.eth.Contract(Jade.abi, deployedNetwork.address);
    const addresses = await web3.eth.getAccounts();
    return { contract, addresses };
};


function mnemonicToKeyPair(mnemonic, derivationPath, password) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, derivationPath, password);
    const { privateKey, publicKey } = hdkey
        .fromMasterSeed(seed)
        .derive(derivationPath);
    return { privateKey: privateKey.toString('hex'), publicKey: publicKey.toString('hex') };
}

router.get('/public', authenticateJWT, async (req, res) => {
    let userexists = await User.findOne({ username: req.user.username });
    if (userexists) {
        let pair = mnemonicToKeyPair(userexists.mnemonic, DERIVATION_PATH,
            MNEMONIC_PASSWORD);
        console.log(pair.privateKey);

        let provider = new HDWalletProvider(
            pair.privateKey, RPC_URL);
        console.log(provider.getAddress());
        let user = await User
            .findOneAndUpdate({ username: req.user.username }, { address: provider.getAddress() }, { new: true })
            .exec();
        res.send({
            address: provider.getAddress(),
        });

    } else {
        res.send({
            message: "mnemonic Key is not valid",
        });
    }
});

router.post('/mint', authenticateJWT, async (req, res) => {
    let key = await init();
    let user = await User.findOne({ username: req.user.username });
    console.log("mint user", user);
    if (user) {
        console.log(user.address, "inside user");
        const result = await key.contract.methods.mint(user.address, 50).send({
            from: key.addresses[0],
        });
        console.log(result);
        res.send({
            message: "minted",
            result
        });
    }else{
        res.send({
            message: "user not found"
        });
    
    }
     
});


router.get('/balance/:address', async (req, res) => {
    let key = await init();
    const result = await key.contract.methods.balanceOf(req.params.address).call();
    console.log(req.params.address, result);
    res.send({
        value: result
    });
});

router.post('/transfer', authenticateJWT, async (req, res) => {
    let key = await init();
    let user = await User.findOne({ username: req.user.username });
    let pair = mnemonicToKeyPair(user.mnemonic, DERIVATION_PATH,
        MNEMONIC_PASSWORD);
    let provider = new HDWalletProvider(
        pair.privateKey, RPC_URL);

    const tx = {
        from: user.address,
        to: req.body.address,
        gas: 50000,
        data: key.contract.methods.transfer(req.body.address, req.body.amount).encodeABI()
    };

    web3.setProvider(provider);
    const signature = await web3.eth.accounts.signTransaction(tx, pair.privateKey);
    await web3.eth.sendSignedTransaction(signature.rawTransaction).on(
        "receipt", (receipt) => {
            console.log(receipt);
            res.send({
                message: "token transferred",
                receipt
            });
        });
    
});

module.exports = router;