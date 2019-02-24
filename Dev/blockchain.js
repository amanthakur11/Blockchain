const sha256=require('sha256');
const currentNodeUrl=process.argv[3];
const uuid = require('uuid/v1');

function Blockchain(){
this.chain=[];// it will contain all the block
this.pendingTransactions=[];// pending transactions which are not yet validated
this.currentNodeUrl= currentNodeUrl;
this.networkNodes=[];
this.createNewBlock(100,'0','0');//it is basically agenesis block, first block or initial block

}
/*
we can use a cunstructor function as above or a class as below to make a blockchain

class Blockchain{
constructor(){
this.chain=[];
this.pendingTransactions=[];
}
//write all the function
}
*/

Blockchain.prototype.createNewBlock=function(nonce, previousBlockHash, hash){//it creates new block

const newBlock={//all of the data will be stored in this newBlock
index: this.chain.length+1, //it will describe what no block this is
timestamp: Date.now(),  //it will give the date of the block creation
transactions: this.pendingTransactions, //this will store the new transactions that are jst made
nonce: nonce, // nonce comes from a proof of work, in this case it could be any number,it basically gives proof that we have created this new block in alegitimate way by using a proof of work method.
hash: hash,//data from our new block single string compressed form of transactions
previousBlockHash: previousBlockHash //is the data from our previous block hashed into a string
};
  
this.pendingTransactions=[];// once we create a new block we will be putting all the trainsaction in this array

this.chain.push(newBlock);// this takes the new block that we have created and pushes into our chain
return newBlock;
}

Blockchain.prototype.getLastBlock=function(){// it is used to get the address/index of the last block

return this.chain[this.chain.length-1];
}
//create new transaction
Blockchain.prototype.createNewTransaction= function(amount, sender, recipient){// it is used to create a new tarnsaction
const newTransaction= {
amount: amount,
sender: sender,
recipient: recipient,
transactionId: uuid().split('-').join('')
};

return newTransaction;
}

//adds transaction to pending transaction and returns the index of the block that this transactions is inserted to.
Blockchain.prototype.addTransactionToPendingTransactions= function(transactionObj){
this.pendingTransactions.push(transactionObj);
return this.getLastBlock()['index'] + 1;

};


//
Blockchain.prototype.hashBlock= function(previousBlockHash,currentBlockData,nonce){// we will pass some data from our chain and in return we will a fixed length string, which is hashed data.

const dataAsString=previousBlockHash+ nonce.toString() + JSON.stringify(currentBlockData);//it turns our data into into string
const hash=sha256(dataAsString);
return hash;
}


Blockchain.prototype.proofOfWork=function(previousBlockHash, currentBlockData){//it generates a bunch of different hash and at the end we are returning the hence for correct hash, it basically calculate the correct nonce
let nonce=0;
let hash=this.hashBlock(previousBlockHash,currentBlockData,nonce);// if the hash created is not starting with 0000 we will run the hash fun in loop
while(hash.substring(0,4)!== '0000'){
nonce++;
hash=this.hashBlock(previousBlockHash,currentBlockData,nonce);
//console.log(hash);
}
return nonce;
}
//if we ever want to go back to our blockchain to make sure our block is valid we have to do is hash that block data with previous block hash and the nonce that was generated from the proof of work when theblock was mined.


//this method is for checking that the chain is valid or not
Blockchain.prototype.chainIsValid= function(blockchain){
let validChain=true;
for(var i=1; i<blockchain.length; i++){//we will compare the current hash of the block and previous block hash for each block to check its validity
const currentBlock=blockchain[i];
const prevBlock=blockchain[i-1];
const blockHash=this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);//rehashing the current block checking the rehashed value and the actual value is same or not

if(blockHash.substring(0, 4) !== '0000') validChain= false;//newly generated hash starts with 4 zeros

if(currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain=false;//chain is not valid


console.log('previousBlockHash =>', prevBlock['hash']);
console.log('currentBlockHash =>', currentBlock['hash']);



};

const genesisBlock= blockchain[0];

const correctNonce= genesisBlock['nonce'] === 100;
const correctPreviousBlockHash= genesisBlock['previousBlockHash']=== '0';
const correctHash= genesisBlock['hash'] === '0';

const correctTransactions= genesisBlock['transactions'].length === 0;

if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

return validChain;

};


Blockchain.prototype.getBlock = function(blockHash){
let correctBlock= null;
this.chain.forEach( block => {

if(block.hash=== blockHash) correctBlock=block

});
return correctBlock;

};


Blockchain.prototype.getTransaction= function(transactionId){
let correctTransaction= null;
let correctBlock=null;

this.chain.forEach( block => {
block.transactions.forEach( transaction =>{
if(transaction.transactionId=== transactionId){
correctTransaction=transaction;
correctBlock=block;
}
});
});

return {
transaction: correctTransaction,
block: correctBlock
};

};


Blockchain.prototype.getAddressData= function(address){//getting the address transaction and address balance

const addressTransactions=[];

this.chain.forEach(block =>{
block.transactions.forEach(transaction => {
if(transaction.sender===address || transaction.recipient===address){
addressTransactions.push(transaction);
}
});
});

let balance =0;
addressTransactions.forEach(transaction =>{
if(transaction.recipient===address) balance +=transaction.amount;
else if(transaction.sender===address) balance -=transaction.amount;
});

return {
addressTransactions: addressTransactions,
addressBalance: balance
};
};

module.exports=Blockchain;
