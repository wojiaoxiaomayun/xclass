onmessage = function(e) {
  var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
  postMessage(workerResult);
}