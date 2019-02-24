const Blockchain=require('./blockchain');

const bitcoin= new Blockchain();//here bitcoin is the object of class blockchain
// first test, testing create new block and createnewtransaction
/*
bitcoin.createNewBlock(23445, 'wefrve34t5grf', 'defrg4fedferg');
bitcoin.createNewTransaction(100,'AMAN89HJKLD','AJITHJ3344DJK');

bitcoin.createNewBlock(234, 'jhkk345bbnk', 'BJKL43T5N54JK09JN');// it will have our transaction

bitcoin.createNewTransaction(1011,'KISHAN89HJKLD','AJITHJ3344DJK');
bitcoin.createNewTransaction(201,'AJIT89HJKLD','AMANHJ3344DJK');
bitcoin.createNewTransaction(333,'PANKAJ89HJKLD','KISHANJ3344DJK');
//console.log(bitcoin.pendingTransactions);
bitcoin.createNewBlock(12312, '0BFNKHEBHDK', 'F90994BNFNK');
*/



//testing the hashing method

/*
const previousBlockHash="JHK343234JHKJLSD";
const currentBlockData=[
{ amount: 1011,
       sender: 'KISHAN89HJKLD',
       recipient: 'AJITHJ3344DJK' },

     { amount: 201,
       sender: 'AJIT89HJKLD',
       recipient: 'AMANHJ3344DJK' },

     { amount: 333,
       sender: 'PANKAJ89HJKLD',
       recipient: 'KISHANJ3344DJK' }
];
*/

//console.log(bitcoin.proofOfWork(previousBlockHash, currentBlockData));//it is used to print in the screen or logged out

//console.log(bitcoin.hashBlock(previousBlockHash,currentBlockData,8289 ));
//console.log("hello");


//testing valid chain


const bc1={
"chain":[{"index":1,"timestamp":1535291519703,"transactions":[],"nonce":100,"hash":"0","previousBlockHash":"0"},{"index":2,"timestamp":1535291623535,"transactions":[],"nonce":18140,"hash":"0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100","previousBlockHash":"0"},{"index":3,"timestamp":1535291694729,"transactions":[{"amount":12.5,"sender":"00","recipient":"3416e050a93711e8a870b12d90d2cda0","transactionId":"7212f2e0a93711e8a870b12d90d2cda0"},{"amount":300,"sender":"GbjKDLFJHKJKLIFO234BNMF","recipient":"hjklEFRKLEFRKJL34KJL","transactionId":"85856f10a93711e8a870b12d90d2cda0"},{"amount":20,"sender":"GbjKDLFJHKJKLIFO234BNMF","recipient":"hjklEFRKLEFRKJL34KJL","transactionId":"8fb8d2b0a93711e8a870b12d90d2cda0"},{"amount":440,"sender":"GbjKDLFJHKJKLIFO234BNMF","recipient":"hjklEFRKLEFRKJL34KJL","transactionId":"956f60c0a93711e8a870b12d90d2cda0"}],"nonce":91311,"hash":"00008e22da3f1ce3dc76179be6363738dd6e942b3b99e81f21065d51e562f609","previousBlockHash":"0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"},{"index":4,"timestamp":1535291746964,"transactions":[{"amount":12.5,"sender":"00","recipient":"3416e050a93711e8a870b12d90d2cda0","transactionId":"9c6c9fa0a93711e8a870b12d90d2cda0"},{"amount":40,"sender":"GbjKDLFJHKJKLIFO234BNMF","recipient":"hjklEFRKLEFRKJL34KJL","transactionId":"af14c6f0a93711e8a870b12d90d2cda0"},{"amount":60,"sender":"GbjKDLFJHKJKLIFO234BNMF","recipient":"hjklEFRKLEFRKJL34KJL","transactionId":"b2783d40a93711e8a870b12d90d2cda0"},{"amount":70,"sender":"GbjKDLFJHKJKLIFO234BNMF","recipient":"hjklEFRKLEFRKJL34KJL","transactionId":"b593fc30a93711e8a870b12d90d2cda0"},{"amount":80,"sender":"GbjKDLFJHKJKLIFO234BNMF","recipient":"hjklEFRKLEFRKJL34KJL","transactionId":"b884b380a93711e8a870b12d90d2cda0"}],"nonce":2423,"hash":"00000a6c8c735958090bbc2bd9bb125827312bd6bd7e7a39cb7e52e751ad4d89","previousBlockHash":"00008e22da3f1ce3dc76179be6363738dd6e942b3b99e81f21065d51e562f609"},{"index":5,"timestamp":1535291761257,"transactions":[{"amount":12.5,"sender":"00","recipient":"3416e050a93711e8a870b12d90d2cda0","transactionId":"bb8ee640a93711e8a870b12d90d2cda0"}],"nonce":64035,"hash":"00001aabdb60a82c4830b93102c87119037f59ae2f945af3a95489f04ae72f6b","previousBlockHash":"00000a6c8c735958090bbc2bd9bb125827312bd6bd7e7a39cb7e52e751ad4d89"},{"index":6,"timestamp":1535291777302,"transactions":[{"amount":12.5,"sender":"00","recipient":"3416e050a93711e8a870b12d90d2cda0","transactionId":"c412ec30a93711e8a870b12d90d2cda0"}],"nonce":165949,"hash":"000093a0f465caa918fa53854b3f14a9ec3c2ab968d8a59097e6943c85901264","previousBlockHash":"00001aabdb60a82c4830b93102c87119037f59ae2f945af3a95489f04ae72f6b"}],"pendingTransactions":[{"amount":12.5,"sender":"00","recipient":"3416e050a93711e8a870b12d90d2cda0","transactionId":"cda30af0a93711e8a870b12d90d2cda0"}],"currentNodeUrl":"http://localhost:3001","networkNodes":[]
};

console.log('VALID: ',bitcoin.chainIsValid(bc1.chain));

//console.log(bitcoin);// LOGGED OUT FROM BLOCKCHAIN






