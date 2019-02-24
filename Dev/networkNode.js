const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});


// create a new transaction
app.post('/transaction', function(req, res) {//it will basically used to add the new transaction to pending transaction of requested node by trsaction/broadcast
	const newTransaction=req.body;
        const blockIndex=bitcoin.addTransactionToPendingTransactions(newTransaction);//adding new transaction to the pending transaction of requested node
        res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});


// broadcast transaction,to create a new transaction we are going to call this end point not transaction end point, it will create a new transaction and it will broadcast the new transaction to all other network.
app.post('/transaction/broadcast', function(req, res) {
	const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);//creating new transaction
	bitcoin.addTransactionToPendingTransactions(newTransaction);//adding the newly created transaction to this node

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {//broadcasting new transaction to all network node.
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,//the data that will be boradcasted
			json: true
		};

		requestPromises.push(rp(requestOptions));//requesting to the other networks-rp(requestOptions)
	});

	Promise.all(requestPromises)//running all the requests.
	.then(data => {//after all the request is ran we will send a response.
		res.json({ note: 'Transaction created and broadcast successfully.' });
	});
});


// mine a block
app.get('/mine', function(req, res) {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {//sending mined block to all the network nodes.
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',//sending the request to the recieve new blockend point of all the networks
			method: 'POST',
			body: { newBlock: newBlock },//sending newblock as data to the network
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)//running all the promises.
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',//adding the reward to all the network for the newly build block
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);//returning the promise for rwquest option array
	})
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			block: newBlock
		});
	});
});


// receive new block
app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;//reciving the new block
	const lastBlock = bitcoin.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;//checking thethe new block is correct or not by comparing the lastblokc hash and new blokc previousblock hash,it will return true or false value
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];//checking the 

	if (correctHash && correctIndex) {//if the block is correct
		bitcoin.chain.push(newBlock);//pushing the block in the chain
		bitcoin.pendingTransactions = [];//emptying the pending transaction
		res.json({//message
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {//if not correct will rject the newblock
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});


// register a node and broadcast it the network
app.post('/register-and-broadcast-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(rp(requestOptions));
	});

	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
			json: true
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });
	});
});


// register a node with the network
app.post('/register-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });
});


// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
});



//if a new node is added to a network than it does not conatains the blocks which were present in the network, so to make new node conatins all the block we will hit consensus end point
app.get('/consensus', function(req, res){//longest chain rule
const requestPromises=[];//it is to keepthe promises
bitcoin.networkNodes.forEach(networkNodeUrl =>{//requesting each of network to acces all of the blockchain  in the network.
const requestOptions = {//request options
uri: networkNodeUrl + '/blockchain',
method: 'GET',
json: true
};

requestPromises.push(rp(requestOptions));//request each option and push the promise return to request promise
});

Promise.all(requestPromises)//performing all the promises,running all request
.then(blockchains => {//this blockchains is an that is filled up with all of the other blockchain that is present in the network

const currentChainLength= bitcoin.chain.length;

let maxChainLength= currentChainLength;//assuming that the current chain is longest

let newLongestChain = null;
let newPendingTransactions= null;

blockchains.forEach(blockchain =>{//iterating to allof the chain in blockchain

if (blockchain.chain.length > maxChainLength){//if the chain length is greater than current chain length than we will change maxchainength
maxChainLength= blockchain.chain.length;
newLongestChain = blockchain.chain;
newPendingTransactions= blockchain.pendingTransactions;

}

});

if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain)))
{

res.json({
note: 'Current chain has not been replaced.',
chain: bitcoin.chain

});

}
else {//if(newLongestChain && bitcoin.chainIsValid(newLongestChain))

bitcoin.chain=newLongestChain;
bitcoin.pendingTransactions =newPendingTransactions;


res.json({
note: 'This chain has been replaced.',
chain: bitcoin.chain

});

}
});

});


app.get('/block/:blockHash', function(req, res){

const blockHash= req.params.blockHash;//grabing the blockhash from the url

const correctBlock=bitcoin.getBlock(blockHash);
res.json({
block: correctBlock

});

});


app.get('/transaction/:transactionId', function(req, res){//get all the transaction from transaction id;

const transactionId=req.params.transactionId;

const transactionData=bitcoin.getTransaction(transactionId);

res.json({
transaction: transactionData.transaction,
block: transactionData.block

});

});

app.get('/address/:address', function(req,res){//get the address and total balance
const address=req.params.address;
const addressData=bitcoin.getAddressData(address);
res.json({
addressData: addressData
});

});

app.get('/block-explorer', function(req, res){
res.sendFile('./block-explorer/index.html', { root: __dirname});

});


app.listen(port, function(){
console.log(`listening on port ${port}....`);
});// the server is listening on port 3000

