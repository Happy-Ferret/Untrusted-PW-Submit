/*start - framescriptlistener*/
var core = {
	addon: {
		id: 'Untrusted-PW-Submit@jetpack'
	}
};
const fsComClient = {
	id: Math.random(), // short for framescript_id
	devuserRequestingAllSubFrames: false,
	register: function(loadIntoSubContentFrames) {
		// send async message, on receive back extend core, then init
		
		console.error('NEW FRAME SCRIPT BORN id:', fsComClient.id);
		
		addMessageListener(core.addon.id, fsComClient.serverMessageListener);
		
		if (loadIntoSubContentFrames) {
			fsComClient.devuserRequestingAllSubFrames = true;
		}
		
		sendAsyncMessage(core.addon.id, {aTopic:'clientRequest_clientBorn', clientId:fsComClient.id});
	},
	unregister: function(aServerId) {
		// called on receive of message from server saying shutdown
		// run uninit, then after complete send async message to server to say done
		removeMessageListener(core.addon.id, fsComClient.serverMessageListener);
		fsComClient.uninit();
		sendAsyncMessage(core.addon.id, {aTopic:'clientRequest_clientShutdownComplete', clientId:fsComClient.id, serverId:aServerId});
	},
	init: function(aCore) {
		// the server response to birth should be here, it should extend core, then run loadIntoFrame (or frames if devuser set loadIntoSubContentFrames true of register func)
		core = aCore;
		console.error('core was made into:', core);
		var frameContentWindowCollection = [content];
		if (fsComClient.devuserRequestingAllSubFrames) {
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
			fsComClient.loadIntoFrame(frameContentWindowCollection[i]);
		}
		
		if (fsComClient.devuserRequestingAllSubFrames) { // if listen to all sub frames, then it adds event listener for future sub frame loads
			addEventListener('DOMContentLoaded', fsComClient.addEventListener_Helper_toConvertFrom_aEvent_to_aContentWindow_for_loadIntoFrame, false); // DOMContentLoaded doesnt work for xul documents so consider this here
		}
	},
	addEventListener_Helper_toConvertFrom_aEvent_to_aContentWindow_for_loadIntoFrame: function(aEvent) {
		console.info('helper aEvent:', aEvent);
		var aContentWindow = aEvent.target.defaultView;
		fsComClient.loadIntoFrame(aContentWindow);
	},
	uninit: function() {
		var frameContentWindowCollection = [content];
		if (fsComClient.devuserRequestingAllSubFrames) {
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
			fsComClient.unloadFromFrame(frameContentWindowCollection[i]);
		}
	},
	serverMessageListener: {
		// listens to messages sent from clients (child framescripts) to me/server
		receiveMessage: function(aMsg) {
			console.error('CLIENT recieving msg:', 'this client id:', fsComClient.id, 'aMsg:', aMsg);
			
			if (!('clientId' in aMsg.json) || (aMsg.json.clientId == fsComClient.id)) {
				// if no clientId then its a message to all so i should accept it
				// or if clientId is equal to this clientId then accept it
				switch (aMsg.json.aTopic) {
					case 'serverRequest_clientInit':
							
							// server sends init after i send server clientBorn message
							fsComClient.init(aMsg.json.core);
							
						break;
					case 'serverRequest_clientShutdown':
					
							fsComClient.unregister(aMsg.json.serverId);
					
						break;
					// start - devuser edit - add your personal message topics to listen to from server
						
					// end - devuser edit - add your personal message topics to listen to from server
					default:
						console.error('CLIENT unrecognized aTopic:', aMsg.json.aTopic, aMsg);
				}
			} else {
				console.warn('this message is not meant for this client', 'this client id:', fsComClient.id, 'intended client target id:', aMsg.json.clientId);
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

fsComClient.register(true); // devuser set 1st arg to true if you want all subframes
console.error('THIS:', this);
//////////// frame script devuser defined functionalities
function doBorderOnBody(aContentWindow) {
	var aContentDocument = aContentWindow.document;
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