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

function getNetworkAddr(IP) {//VLSMは考慮しない
	const q1 = IP.split("/");
	IP = q1[0].split(".");
	const subnet = +q1[1] / 8;
	let returnAddr = "";
	for (let i = 0;i < subnet;i += 1){
		if(i != 0)
			returnAddr += ".";
		returnAddr += IP[i];
	}
return returnAddr;
}

rl.on('line', (lineVal) => {
	const lineValArr = lineVal.split(",");
	const Ftime = lineValArr[0];
	const networkAddr = getNetworkAddr(lineValArr[1]);
	const Status = lineValArr[2];

	if(Status === "-"){//timeout,BAD
		if(serverStatus[networkAddr]){
			if(!serverStatus[networkAddr].broken){//prev:OK,Now:BAD
				serverStatus[networkAddr].broken = true;
				serverStatus[networkAddr].errorCount = 0;
				serverStatus[networkAddr].log.push(Ftime);
			}
		}else{//first bad
			serverStatus[networkAddr] = {"broken": true, "log": [Ftime], "errorCount": 0};
		}
		serverStatus[networkAddr].errorCount++;
	}else{//OK
		if(serverStatus[networkAddr] && serverStatus[networkAddr].broken){//prev:BAD,Now:OK
			if(serverStatus[networkAddr].errorCount >= timeoutThreshold)
				serverStatus[networkAddr].log.push(Ftime)
			else
				serverStatus[networkAddr].log.pop();
			serverStatus[networkAddr].broken = false;
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
