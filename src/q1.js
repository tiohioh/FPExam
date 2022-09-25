'use strict'
//argv[2]にて引数(ログファイルのパス)を取)

const inputFilePath = process.argv[2];
const fs = require('fs'); const readline = require('readline');
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
//serverStatus["IP"] = {broken: true, }

rl.on('line', (lineVal) => {
	const lineValArr = lineVal.split(",");
	const Ftime = lineValArr[0];
	const IPAddr = lineValArr[1];
	const Status = lineValArr[2];

	if(Status === "-"){//timeout,BAD
		if(serverStatus[IPAddr]){
			if(!serverStatus[IPAddr].broken){//prev:OK,Now:BAD
				serverStatus[IPAddr].broken = true;
				serverStatus[IPAddr].log.push(Ftime);
			}
		}else{
			serverStatus[IPAddr] = {"broken": true, "log": [Ftime]};
		}
	}else{//OK
		if(serverStatus[IPAddr] && serverStatus[IPAddr].broken){//prev:BAD,Now:OK
			serverStatus[IPAddr].broken = false;
			serverStatus[IPAddr].log.push(Ftime);
		}
	}
	//writeStream.write(lineString + '\n');
});


rl.on('close', () => {
	for(const key of  Object.keys(serverStatus)){
		const IPObj = serverStatus[key];
		for(let i = 0;i < IPObj.log.length;i += 2){
			if(IPObj.log[i + 1])
				console.log(`${key}: ${IPObj.log[i]}-${IPObj.log[i+1]}`);
			else
				console.log(`${key}: ${IPObj.log[i]}-`);
		}
	}
});
