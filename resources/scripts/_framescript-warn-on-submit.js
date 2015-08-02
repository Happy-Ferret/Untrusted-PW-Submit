/*start - framescriptlistener*/
var core = {
	addon: {
		id: 'Untrusted-PW-Submit@jetpack'
	}
};
const fsCommClient = {
	id: Math.random(), // short for framescript_id
	devuserRequestingAllSubFrames: false,
	register: function(loadIntoSubContentFrames) {
		// send async message, on receive back extend core, then init
		
		console.error('NEW FRAME SCRIPT BORN id:', fsCommClient.id);
		
		addMessageListener(core.addon.id, fsCommClient.serverMessageListener);
		
		if (loadIntoSubContentFrames) {
			fsCommClient.devuserRequestingAllSubFrames = true;
		}
		
		sendAsyncMessage(core.addon.id, {aTopic:'clienBorn', clientId:fsCommClient.id});
	},
	unregister: function() {
		// called on receive of message from server saying shutdown
		// run uninit, then after complete send async message to server to say done
		uninit();
		sendAsyncMessage(core.addon.id, {aTopic:'clientUninited', clientId:fsCommClient.id});
	},
	init: function(aCore) {
		// the server response to birth should be here, it should extend core, then run loadIntoFrame (or frames if devuser set loadIntoSubContentFrames true of register func)
		core = aCore;
		
		var frameContentWindowCollection = [content];
		if (fsCommClient.devuserRequestingAllSubFrames) {
			// then collect all sub contentframes windows so can run loadIntoFrame on all of them
			for (var i=0; i<frameContentWindowCollection.length; i++) {
				var framesInThisFrame = frameContentWindowCollection[i].frames;
				console.info('in frame i:', i, 'this many subframes were found:', framesInThisFrame.length);
				for (var j=0; j<framesInThisFrame.length; j++) {
					frameContentWindowCollection.push(framesInThisFrame[j]);
				}
			}
		}
		for (var i=0; i<frameContentWindowCollection.length; i++) {
			loadIntoFrame(frameContentWindowCollection[i]);
		}
		
		if (fsCommClient.devuserRequestingAllSubFrames) { // if listen to all sub frames, then it adds event listener for future sub frame loads
			addEventListener('DOMContentLoaded', fsCommClient.addEventListener_Helper_toConvertFrom_aEvent_to_aContentWindow_for_loadIntoFrame, false); // DOMContentLoaded doesnt work for xul documents so consider this here
		}
	},
	addEventListener_Helper_toConvertFrom_aEvent_to_aContentWindow_for_loadIntoFrame: function(aEvent) {
		var aContentWindow = aEvent.target;
		loadIntoFrame(aContentWindow);
	},
	uninit: function() {
		var frameContentWindowCollection = [content];
		if (fsCommClient.devuserRequestingAllSubFrames) {
			// then collect all sub contentframes windows so can run unloadFromFrame on all of them
			for (var i=0; i<frameContentWindowCollection.length; i++) {
				var framesInThisFrame = frameContentWindowCollection[i].frames;
				console.info('in frame i:', i, 'this many subframes were found:', framesInThisFrame.length);
				for (var j=0; j<framesInThisFrame.length; j++) {
					frameContentWindowCollection.push(framesInThisFrame[j]);
				}
			}
		}
		for (var i=0; i<frameContentWindowCollection.length; i++) {
			unloadFromFrame(frameContentWindowCollection[i]);
		}
	},
	serverMessageListener: {
		// listens to messages sent from clients (child framescripts) to me/server
		receiveMessage: function(aMsg) {
			console.error('recieving msg:', aMsg);
			switch (aMsg.json.aTopic) {
				case 'serverResponseToBirth':
						
						init(aMsg.json.aCore);
						
					break;
				case 'shutdown'
				
						unregister();
				
					break;
				// start - devuser edit - add your personal message topics to listen to from server
					
				// end - devuser edit - add your personal message topics to listen to from server
				default:
					console.error('unrecognized aTopic:', aMsg);
			}
		}
	},
	loadIntoFrame: function(aContentWindow) {
		// frame here means into each iframe window or parent window
		// start - devuser edit
			//if (aContentWindow != content) {} // this is how to test if this is not the top most window, its a subframe
			doBorderOnBody(aContentWindow);
		// end - devuser edit
	},
	unloadFromFrame: function(aContentWindow) {
		// frame here means into each iframe window or parent window
		// start - devuser edit
			//if (aContentWindow != content) {} // this is how to test if this is not the top most window, its a subframe
			unBorderOnBody(aContentWindow);
		// end - devuser edit
	}
}
/*end - framescriptlistener*/

fsCommClient.register(); // devuser set 1st arg to true if you want all subframes


function doBorderOnBody(aContentWindow) {
	var aContentDocument = aContentWindow.document;
	if (!aContentDocument) {
		aContentDocument = aEvent.target;
		console.error('aEvent:', aEvent);
	}
	if (aContentDocument.body) {
		aContentDocument.body.style.border = '5px solid steelblue';
		console.error('bordered it', aContentDocument.defaultView.location.href);
	} else {
		console.error('has not aContentDocument.body', aContentDocument.defaultView.location.href);
	}
}

function unBorderOnBody(aContentWindow) {
	var aContentDocument = aContentWindow.document;
	if (aContentDocument.body) {
		aContentDocument.body.style.border = '';
		console.error('unbordered it', aContentDocument.defaultView.location.href);
	} else {
		console.error('has not aContentDocument.body', aContentDocument.defaultView.location.href);
	}
}