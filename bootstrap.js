// Imports
const {classes: Cc, interfaces: Ci, manager: Cm, results: Cr, utils: Cu, Constructor: CC} = Components;
Cu.import('resource://gre/modules/devtools/Console.jsm');
Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

// Globals
const core = {
	addon: {
		name: 'Untrusted-PW-Submit',
		id: 'Untrusted-PW-Submit@jetpack',
		path: {
			name: 'untrusted-pw-submit',
			content: 'chrome://untrusted-pw-submit/content/',
			images: 'chrome://untrusted-pw-submit/content/resources/images/',
			locale: 'chrome://untrusted-pw-submit/locale/',
			resources: 'chrome://untrusted-pw-submit/content/resources/',
			scripts: 'chrome://untrusted-pw-submit/content/resources/scripts/',
			styles: 'chrome://untrusted-pw-submit/content/resources/styles/'
		}
	},
	os: {
		name: OS.Constants.Sys.Name.toLowerCase(),
		toolkit: Services.appinfo.widgetToolkit.toLowerCase(),
		xpcomabi: Services.appinfo.XPCOMABI
	},
	firefox: {
		pid: Services.appinfo.processID,
		version: Services.appinfo.version
	}
};

const JETPACK_DIR_BASENAME = 'jetpack';

// Lazy Imports
const myServices = {};
XPCOMUtils.defineLazyGetter(myServices, 'hph', function () { return Cc['@mozilla.org/network/protocol;1?name=http'].getService(Ci.nsIHttpProtocolHandler); });
XPCOMUtils.defineLazyGetter(myServices, 'sb', function () { return Services.strings.createBundle(core.addon.path.locale + 'bootstrap.properties?' + Math.random()); /* Randomize URI to work around bug 719376 */ });

function extendCore() {
	// adds some properties i use to core based on the current operating system, it needs a switch, thats why i couldnt put it into the core obj at top
	switch (core.os.name) {
		case 'winnt':
		case 'winmo':
		case 'wince':
			core.os.version = parseFloat(Services.sysinfo.getProperty('version'));
			// http://en.wikipedia.org/wiki/List_of_Microsoft_Windows_versions
			if (core.os.version == 6.0) {
				core.os.version_name = 'vista';
			}
			if (core.os.version >= 6.1) {
				core.os.version_name = '7+';
			}
			if (core.os.version == 5.1 || core.os.version == 5.2) { // 5.2 is 64bit xp
				core.os.version_name = 'xp';
			}
			break;
			
		case 'darwin':
			var userAgent = myServices.hph.userAgent;
			//console.info('userAgent:', userAgent);
			var version_osx = userAgent.match(/Mac OS X 10\.([\d\.]+)/);
			//console.info('version_osx matched:', version_osx);
			
			if (!version_osx) {
				throw new Error('Could not identify Mac OS X version.');
			} else {
				var version_osx_str = version_osx[1];
				var ints_split = version_osx[1].split('.');
				if (ints_split.length == 1) {
					core.os.version = parseInt(ints_split[0]);
				} else if (ints_split.length >= 2) {
					core.os.version = ints_split[0] + '.' + ints_split[1];
					if (ints_split.length > 2) {
						core.os.version += ints_split.slice(2).join('');
					}
					core.os.version = parseFloat(core.os.version);
				}
				// this makes it so that 10.10.0 becomes 10.100
				// 10.10.1 => 10.101
				// so can compare numerically, as 10.100 is less then 10.101
				
				//core.os.version = 6.9; // note: debug: temporarily forcing mac to be 10.6 so we can test kqueue
			}
			break;
		default:
			// nothing special
	}
	
	console.log('done adding to core, it is now:', core);
}

// START - Addon Functionalities					
// global editor values

// END - Addon Functionalities

/*start - windowlistener*/
var windowListener = {
	//DO NOT EDIT HERE
	onOpenWindow: function (aXULWindow) {
		// Wait for the window to finish loading
		var aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		aDOMWindow.addEventListener('load', function () {
			aDOMWindow.removeEventListener('load', arguments.callee, false);
			windowListener.loadIntoWindow(aDOMWindow);
		}, false);
	},
	onCloseWindow: function (aXULWindow) {},
	onWindowTitleChange: function (aXULWindow, aNewTitle) {},
	register: function () {
		
		// Load into any existing windows
		let DOMWindows = Services.wm.getEnumerator(null);
		while (DOMWindows.hasMoreElements()) {
			let aDOMWindow = DOMWindows.getNext();
			if (aDOMWindow.document.readyState == 'complete') { //on startup `aDOMWindow.document.readyState` is `uninitialized`
				windowListener.loadIntoWindow(aDOMWindow);
			} else {
				aDOMWindow.addEventListener('load', function () {
					aDOMWindow.removeEventListener('load', arguments.callee, false);
					windowListener.loadIntoWindow(aDOMWindow);
				}, false);
			}
		}
		// Listen to new windows
		Services.wm.addListener(windowListener);
	},
	unregister: function () {
		// Unload from any existing windows
		let DOMWindows = Services.wm.getEnumerator(null);
		while (DOMWindows.hasMoreElements()) {
			let aDOMWindow = DOMWindows.getNext();
			windowListener.unloadFromWindow(aDOMWindow);
		}
		/*
		for (var u in unloaders) {
			unloaders[u]();
		}
		*/
		//Stop listening so future added windows dont get this attached
		Services.wm.removeListener(windowListener);
	},
	//END - DO NOT EDIT HERE
	loadIntoWindow: function (aDOMWindow) {
		if (!aDOMWindow) { return }
		
		if (aDOMWindow.gBrowser) {

		}
	},
	unloadFromWindow: function (aDOMWindow) {
		if (!aDOMWindow) { return }
		
		if (aDOMWindow.gBrowser) {
			
		}
	}
};
/*end - windowlistener*/


function install() {}
function uninstall() {
	// delete imgur history file
}

const frameScriptURL = core.addon.path.scripts + '_framescript-warn-on-submit.js?' + Math.random(); /* Randomize URI to work around bug 719376 */
function startup(aData, aReason) {
	// core.addon.aData = aData;
	extendCore();
	
	//windowlistener more
	windowListener.register();
	//end windowlistener more
	
	var globalMM = Cc['@mozilla.org/globalmessagemanager;1'].getService(Ci.nsIMessageListenerManager);
	globalMM.loadFrameScript(frameScriptURL, true);

}

function shutdown(aData, aReason) {
	if (aReason == APP_SHUTDOWN) { return }
	
	//windowlistener more
	windowListener.unregister();
	//end windowlistener more

	var globalMM = Cc['@mozilla.org/globalmessagemanager;1'].getService(Ci.nsIMessageListenerManager);
	globalMM.removeDelayedFrameScript(frameScriptURL);
	globalMM.broadcastAsyncMessage(core.addon.id, {aTopic:'uninit'});
	
	// an issue with this unload is that framescripts are left over, i want to destory them eventually
}

// start - common helper functions
// end - common helper functions