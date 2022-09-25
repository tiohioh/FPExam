<?php
//q1 log generator
$log_txt = '';
$IP_addrs = array(
"10.20.30.1/16",
"10.20.30.2/16",
"10.20.30.3/16",
"10.20.30.4/16",
"192.168.1.1/24",
"192.168.1.2/24",
"192.168.11.1/24",
"192.168.11.10/24",
);
$IP_length = count($IP_addrs) - 1;
for($i = 0;$i < 30;++$i){
	$status_rand = rand(0,20);
	$status = $status_rand == 0 ? "-" : $status_rand;
	$log_txt .= "{$i},{$IP_addrs[rand(0,$IP_length)]},{$status}\n";
}
file_put_contents("./q1log.txt",$log_txt);
echo "OK".PHP_EOL;
?>
