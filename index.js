//jshint esversion :8
const Web3 = require('web3');
const Jade = require('./build/contracts/Jade.json');

const init = async () =>{
    const web3 = new Web3('http://localhost:7545');

    const id = await web3.eth.net.getId();
    const deployedNetwork = Jade.networks[id];
    const contract = new web3.eth.Contract(Jade.abi,deployedNetwork.address);

     const addresses = await web3.eth.getAccounts();
     await contract.methods.mint("0xe48E74e25a5f3c98CD588F6235504b5f4aAE080B",50).send({
         from : addresses[0],        
    });
     const result = await contract.methods.balanceOf("0xe48E74e25a5f3c98CD588F6235504b5f4aAE080B").call();
     console.log(result);

    const receipt =  await contract.methods.transfer("0x15f46c1eF2764d63d52d281292fb22E9B2328ba0",50).send({
         from : addresses[1],
     });
     console.log(receipt);

        const result1 = await contract.methods.balanceOf("0x15f46c1eF2764d63d52d281292fb22E9B2328ba0").call();
      console.log(result1);
 };

init();