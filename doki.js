console.log("1");

function sleep(milliSeconds) {
  var startTime = new Date().getTime();
  while (new Date().getTime() < startTime + milliSeconds);

  console.log("2");
}

sleep(5000); // 実行するのに5秒かかる

setTimeout(console.log("2.5"),5000);

console.log("3");

var logresult = function(){
  console.log(5);
};

console.log(4);
setTimeout(logresult, 5000);
console.log(6);