const cliProgress = require('cli-progress');
 
function status() {
	
	// create new progress bar
    const b1 = new cliProgress.Bar({
        format: 'Progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Speed: {speed}'
    });

	this.b1 = b1;

;}

status.prototype.testrun = function(callback) {
	
	var self = this;

	self.callback = callback;

	// initialize the bar -  defining payload token "speed" with the default value "N/A"
	self.b1.start(200, 0, {
		speed: "N/A"
	});

	// the bar value - will be linear incremented
    let value = 0;

    const speedData = [];

    // 20ms update rate
    let timer = setInterval(function(){
        // increment value
        value++;

        // example speed data
        speedData.push(Math.random()*2+5);
        const currentSpeedData = speedData.splice(-10);

        // update the bar value
        self.b1.update(value, {
            speed: (currentSpeedData.reduce(function(a, b) { return a + b; }, 0) / currentSpeedData.length).toFixed(2) + "mb/s"
        });

        // set limit
        if (value >= self.b1.getTotal()){
            // stop timer
            clearInterval(timer);

			self.b1.stop();
				
			self.callback("> Done!");
        }
	}, 20);	
}


status.prototype.test = function() {




};


module.exports = status;