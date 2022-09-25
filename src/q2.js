'use strict'
//argv[2]にて引数(ログファイルのパス)を取)

const inputFilePath = process.argv[2];
const timeoutThreshold = +process.argv[3] | 0;//問題文における回数Nのこと
if(isNaN(timeoutThreshold) || timeoutThreshold <= 0){
	console.error("timeoutThresholdCount is required argment.You must input as Numeric value more than 1.");
	process.exit(0);
}

const fs = require('fs');
const readline = require('readline');
if(inputFilePath === undefined){
	console.error("File path is required argment.");
}
if(!fs.existsSync(inputFilePath)){
	console.error(`Selected file ${inputFilePath} is not exists.`);
	process.exit(0);
}

const readStream = fs.createReadStream(inputFilePath);
const writeStream = fs.createWriteStream('./output.csv');
const rl = readline.createInterface({
	input: readStream,
	output: writeStream
});

var serverStatus = new Object();

rl.on('line', (lineVal) => {
	const lineValArr = lineVal.split(",");
	const Ftime = lineValArr[0];
	const IPAddr = lineValArr[1];
	const Status = lineValArr[2];

	if(Status === "-"){//timeout,BAD
		if(serverStatus[IPAddr]){
			if(!serverStatus[IPAddr].broken){//prev:OK,Now:BAD
				serverStatus[IPAddr].broken = true;
				serverStatus[IPAddr].errorCount = 0;
				serverStatus[IPAddr].log.push(Ftime);
			}
		}else{//first bad
			serverStatus[IPAddr] = {"broken": true, "log": [Ftime], "errorCount": 0};
		}
		serverStatus[IPAddr].errorCount++;
	}else{//OK
		if(serverStatus[IPAddr] && serverStatus[IPAddr].broken){//prev:BAD,Now:OK
			if(serverStatus[IPAddr].errorCount >= timeoutThreshold)
				serverStatus[IPAddr].log.push(Ftime)
			else
				serverStatus[IPAddr].log.pop();
			serverStatus[IPAddr].broken = false;
		}
	}
});


rl.on('close', () => {
	for(const key of  Object.keys(serverStatus)){
		const IPObj = serverStatus[key];
		for(let i = 0;i < IPObj.log.length;i += 2){
			console.log(`${key}: ${IPObj.log[i]}-${IPObj.log[i+1]}`);
		}
	}
});
