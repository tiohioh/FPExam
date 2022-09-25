'use strict'
//argv[2]にて引数(ログファイルのパス)を取)
const TIMEOUT_MS = 4000;//タイムアウトの定数(ここでは4sと仮定)

const inputFilePath = process.argv[2];
const timeoutThreshold = +process.argv[3] | 0;//問題文における過負荷状態のしきい値時間のこと
const averageCount = +process.argv[4] | 0;
if(isNaN(timeoutThreshold) || timeoutThreshold <= 0){
	console.error("timeoutThreshold Average[ms] is required argment.You must input as Numeric value more than 1.");
	process.exit(0);
}
if(isNaN(averageCount) || averageCount <= 0){
        console.error("Average Count is required argment.You must input as Numeric value more than 1.");
	process.exit(0);
}
const fs = require('fs'); const readline = require('readline');
if(inputFilePath === undefined){
	console.error("File path is required argment.");
	process.exit(0);
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

	if(!serverStatus[IPAddr]){
		serverStatus[IPAddr] = {"busy": false, "log": [], "count": 0,"averageBuffer": [],"prevTime":false};
	}
	serverStatus[IPAddr].count++;
	serverStatus[IPAddr].averageBuffer.push(Status === "-" ? TIMEOUT_MS : +Status);
	if(serverStatus[IPAddr].count >= averageCount){
		if(serverStatus[IPAddr].averageBuffer.length > averageCount)
			serverStatus[IPAddr].averageBuffer.shift();
		const average = serverStatus[IPAddr].averageBuffer.reduce((sum, elem) => sum + elem, 0) / averageCount;
		if(average >= timeoutThreshold){
//console.log(Ftime,IPAddr,serverStatus[IPAddr].averageBuffer, average,serverStatus[IPAddr].log)
			if(!serverStatus[IPAddr].busy){
				serverStatus[IPAddr].busy = true;
				serverStatus[IPAddr].log.push(Ftime);
			}
		}else{
			if(serverStatus[IPAddr].busy){
				serverStatus[IPAddr].busy = false;
				serverStatus[IPAddr].log.push(serverStatus[IPAddr].prevTime);
			}
		}
		serverStatus[IPAddr].prevTime = Ftime;
	}
});


rl.on('close', () => {
	for(const key of Object.keys(serverStatus)){
		const IPObj = serverStatus[key];
		for(let i = 0;i < IPObj.log.length;i += 2){
			if(IPObj.log[i + 1])
				console.log(`${key}: ${IPObj.log[i]}-${IPObj.log[i+1]}`);
			else
				console.log(`${key}: ${IPObj.log[i]}-`);
		}
	}
});

