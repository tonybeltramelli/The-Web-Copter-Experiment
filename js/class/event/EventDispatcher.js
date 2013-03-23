/*!
 * author Tony Beltramelli
 * http://www.tonybeltramelli.com
 * 
 */

EventDispatcher = function() {
	this.events = {};
};

EventDispatcher.prototype = {
	constructor: EventDispatcher,
	addEventListener : function(eventName, callback) {
	    var events = this.events,
	    callbacks = events[eventName] = events[eventName] || [];
	    callbacks.push(callback);
	},
	dispatchEvent : function(eventName, args) {
	    var callbacks = this.events[eventName];
	    for (var i = 0, l = callbacks.length; i < l; i++) {
	        callbacks[i].apply(null, args);
	    }
	}
}

Event =
{
	INIT : "init",
	SHOW : "show",
	HIDE : "hide",
	OPEN : "open",
	CLOSE : "close",
	UPDATE : "update",
	IS_LOADING : "is_loading",
	IS_LOADED : "is_loaded",
	COMPLETE : "complete",
	ON_CHANGE : "on_change",
	OPENED : "opened",
	CLOSED : "closed",
	READY : "ready"
}