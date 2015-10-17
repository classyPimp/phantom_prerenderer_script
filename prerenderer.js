/*USAGE

put in path, run
phantomjs --disk-cache=no(<-optional) 
	<path_to_this_script/script_name.js> 
	<port (8888)> 
	<your_app_path(http://localhost:3000)>

WHAT IT DOES
on any request, makes request to
your_app + request.url with phantomjs
and returns you rendered page
primary usage for seo
*/
var system = require('system');

if (system.args.length < 3) {
    console.log("Missing arguments.");
    phantom.exit();
}

var server = require('webserver').create(); 
var port = parseInt(system.args[1]);
var urlPrefix = system.args[2];

var renderHtml = function(url, cb) {
    var page = require('webpage').create();
    page.settings.loadImages = false;
    page.settings.localToRemoteUrlAccessEnabled = true;
    page.onLoadFinished = function() {
        cb(page.content);
        page.close();
    };
    //shim for react for rendering without bind error
    page.onInitialized = function(){
      page.evaluate(function(){
      	Function.prototype.bind = Function.prototype.bind || function (thisp) {
				  var fn = this;
				  return function () {
				      return fn.apply(thisp, arguments);
				  };
				}
      }, false)
    };
    
    page.open(url);
};

server.listen(port, function (request, response) {
    console.log(request.url);
    var url = urlPrefix
        + request.url;
    renderHtml(url, function(html) {
        response.statusCode = 200;
        response.write(html);
        response.close();
    });
});

console.log('Listening on ' + port + '...');
console.log('Press Ctrl+C to stop.');