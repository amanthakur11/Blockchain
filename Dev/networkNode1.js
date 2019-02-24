const express = require('express')//library for server
const app = express()
const bodyParser=require('body-parser');

const Blockchain=require('./blockchain');
const bitcoin=new Blockchain();//WE INITATE OUR BLOCKCHAIN AND IT WILL CREATE THE GENESIS BLOCK

const port=process.argv[2];//it is basically used to provide different port no so that we can make a decentralized network

const rp=require('request-promise');

const uuid=require('uuid/v1');// creates a unique random string for us, it can be used as address
const nodeAddress= uuid().split('-').join('');//it cintains - so we are taking - out of it


//app.get('/', function (req, res) {//get end point
//  res.send('Hello aman thakur')
//})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));//if request comes in with json data than we simply parse the data and can acces it

//it used to call blockchain file
app.get('/blockchain',function(req,res){
res.send(bitcoin);
});

//it will create a new transaction
app.post('/transaction', function(req,res){

const blockIndex=bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
res.json({note: `Transaction will be added in block ${blockIndex}.`});
});

app.get('/mine',function(req,res){//it will mine a new block for us


const lastBlock=bitcoin.getLastBlock();//geting the lastblock
const previousBlockHash=lastBlock['hash'];//previous block hash value
const  currentBlockData={//making a current block
transaction: bitcoin.pendingTransactions,//all the pending transactions
index: lastBlock['index']+1
};

const nonce=bitcoin.proofOfWork(previousBlockHash, currentBlockData);// calculating nonce

const blockHash=bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);


bitcoin.createNewTransaction(12.5, "00", nodeAddress);//it is mining reward we are sending to the mining person

const newBlock=bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
res.json({
note: "New block mined successfully",
block: newBlock 
});//sending the result

});

//connecting all the node

//register a node and broadcast it to the network
app.post('/register-and-broadcast-node', function(req, res){//it allow us to create a decentralized blockchain network,create a network and add new nodes to that network.
const newNodeUrl=req.body.newNodeUrl;//taking the new node url and registering it with this current node.
if(bitcoin.networkNodes.indexOf(newNodeUrl)== -1) bitcoin.networkNodes.push(newNodeUrl);//if new node is not present in array than push it

const regNodesPromises=[];
//below we are broadcasting the network url to all other network
bitcoin.networkNodes.forEach(networkNodeUrl => {//cycling through all of the nodes that are present in our netowrk
const requestOptions={//object,using these options to make arequest to each one
uri:networkNodeUrl+'/register-node',
method: 'POST',
body:{newNodeUrl: newNodeUrl},
json: true
};

regNodesPromises.push(rp(requestOptions));//pushing all the request
});

//register all of the network node that are already present inside of our network with our new node so we mke a single request to our new node
Promise.all(regNodesPromises)
.then(data =>{//every single request willrun here
const bulkRegisterOptions={
uri: newNodeUrl+ '/register-nodes-bulk',
method: 'POST',
body:{allNetowrkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl]},//... is spread operator,urls of all the nodes that are already present in our network
json: true
};

return rp(bulkRegisterOptions);
})
.then(data=> {
res.json({note: 'New Node registered with network successfully' });//after the registeration we are sending back the message

});



});

//register a node with the network
app.post('/register-node', function(req,res){//is where every node in the network is going to recive the broadcast that is sent out by our register and broadcast end point, it only have to register the new node with node that recives this request.

const newNodeUrl=req.body.newNodeUrl;//sending to this end point
const nodeNotAlreadyPresent=bitcoin.networkNodes.indexOf(newNodeUrl)==-1;
const notCurrentNode=bitcoin.currentNodeUrl !== newNodeUrl;
if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);//if this new node is not already present in our network node array and if the new node is not the same url as the current node then we jst add new node to netowrk node array.
res.json({note: 'New node registered successfully.'});

});

//register multiple nodes at once
app.post('/register-nodes-bulk', function(req,res){//it will accept the data which conatin the urls of each every nodes prresent in  network,and we are going to register all of these node with new nodes.

const allNetworkNodes=req.body.allNetworkNodes;//all the node url in our blockchain

allNetworkNodes.forEach(networkNodeUrl=>{//register each network node url with the current node

const nodeNotAlreadyPresent= bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;//if network node not present in network than we will addto the network.
const notCurrentNode=bitcoin.currentNodeUrl !== networkNodeUrl;//if node not current node url
if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);

});

res.json({ note: 'Bulk registration successsful.'});
});



app.listen(port, function(){
console.log(`listening on port ${port}....`);
});// the server is listening on port 3000

