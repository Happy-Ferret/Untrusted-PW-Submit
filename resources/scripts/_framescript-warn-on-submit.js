const fsID = Math.random(); //short for framescript_id

console.error('this:', this);
function doBorderOnBody(aEvent, aDocument) {
	if (!aDocument) {
		aDocument = aEvent.target;
		console.error('aEvent:', aEvent);
	}
	if (aDocument.body) {
		aDocument.body.style.border = '5px solid steelblue';
		console.error('bordered it', aDocument.defaultView.location.href);
	} else {
		console.error('has not aDocument.body', aDocument.defaultView.location.href);
	}
}

function unBorderOnBody(aDocument) {
	if (aDocument.body) {
		aDocument.body.style.border = '';
		console.error('unbordered it', aDocument.defaultView.location.href);
	} else {
		console.error('has not aDocument.body', aDocument.defaultView.location.href);
	}
}

function uninit() {
	console.error('received unit msg');
	removeEventListener('DOMContentLoaded', doBorderOnBody, false); // for future page loads
	
	unBorderOnBody(content.document);
	
	var frames = content.frames;
	console.error('total frames:', frames.length);
	for (var i=0; i<frames.length; i++) {
		console.error('frames i:', i);
		unBorderOnBody(frames[i].document);
	}
}

function init() {
	console.error('initing');
	addEventListener('DOMContentLoaded', doBorderOnBody, false); // for future page loads
	doBorderOnBody(null, content.document); // for currently open frames
	
	var frames = [content.document];
	for (var i=0; i<frames.length; i++) {
		console.error('top of collect frames loop, frames.length', frames.length);
	}
	
	var frames = content.frames;
	console.error('total frames:', frames.length);
	for (var i=0; i<frames.length; i++) {
		console.error('frames i:', i);
		doBorderOnBody(frames[i].document);
	}
	
	console.error('dont init');
}
init();

/*
function startup() {
	// i tell my bootstrap that this framescript was born with this id. then on uninstall after getting confirum of uninit on each id then i can destory the frame scripts
	sendAsyncMessage('Untrusted-PW-Submit@jetpack', {aTopic:'childFrameScriptBorn', fsID:fsID});
}
startup(); // this runs frame script load
*/

var messageHandler = {
	receiveMessage: function(aMsg) {
		console.error('recieving msg:', aMsg);
		switch (aMsg.json.aTopic) {
			case 'uninit':
					
					uninit();
					
				break;
			/*
			case 'init':
					
					init();
					
				break;
			*/
			default:
				console.error('unrecognized aTopic:', aMsg);
		}
	}
}

addMessageListener('Untrusted-PW-Submit@jetpack', messageHandler);