// json2.js:          https://github.com/douglascrockford/JSON-js/raw/master/json2.js
// compressed with:   http://dean.edwards.name/packer/
//
var JSON;if(!JSON){JSON={}}(function(){"use strict";function f(n){return n<10?'0'+n:n}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key)}if(typeof rep==='function'){value=rep.call(holder,key,value)}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null'}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null'}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v)}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v}}if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' '}}else if(typeof space==='string'){indent=space}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value})}}if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j}throw new SyntaxError('JSON.parse');}}}());

jQuery.noConflict();

// A PubSub implementation based on the localStorage.storage event.
// Basically there are two functions: PubSub.publish and PubSub.subscribe.
// Both take a string as PubSub channel id as the first argument.
// PubSub.subscribe takes a callback function as a second argument.
// 
// We're working around several quirks of the storage event to get the desired behaviour:
// * Duplicate messages trigger the subscribe callback twice. The plain storage event wouldn't do that.
// * Publishing triggers the callback of subscriptions within the same window, too.
//   The plain storage event wouldn't do that, although some browsers disregard the specs, here.
// * JSON serialization is used, so all nativ JSON types can be published.
// 
// To avoid name clashes "__pubsub__" is used as namespace in the localStorage.
jQuery( function($) {
  
  if( typeof( window.PubSub ) == 'undefined' ) { window.PubSub = {}; }
  
  window.PubSub = {
    channels:    {},
    
    // Subscribe a given channel and register a callback.
    subscribe: function( channel, callback ) {
      if( typeof(channel) != 'string' ){ return false; }
      if( typeof(callback) != 'function' && typeof(callback) != 'object' ){ return false; }
      
      var current_value = this.storage.get_raw(channel);
      
      this.channels[channel] = current_value;         // Initial den aktuellen rohen Wert merken
      
      this.storage.bindEvent(channel, callback);     // Der übergebenen Callback ist unser Event-Listener
      
      return true;
    },
    
    // Publish a value on a channel.
    publish: function( channel, value ) {
      if( typeof(channel) != 'string' ){ return false; }
      
      this.storage.set(channel, JSON.stringify(value)); // Neue Information in den HTML5 Local Storage schreiben
      PubSub.storage.eventHandler();                    // Manuell Event triggern, da im selben Fenter 'storage' Events (i.d.R) nicht ausgelöst werden
      
      return true;
    },
    
    // Unsubscribe a given channel.
    unsubscribe: function( channel ) {
      if( typeof( localStorage.getItem(channel) ) == 'undefined' ) { return false; }
      
      var key = '__pubsub__' + channel;
      
      $(window).unbind(key);                      // Löscht Event Listener für den Kanal-Event
      
      return true;
    },
    
    // Returns the value of the given channel.
    // PubSub usually doesn't have this, but we're using a storage anyway so why not use this?
    value: function( channel ){
      if( typeof(channel) != 'string' ){ return false; }
      return JSON.parse(this.storage.get(channel));
    },
    
    storage: {
      
      // Gets the current value of the localStorage and removes the duplicate buster.
      get: function(channel){
        var value = this.get_raw(channel);
        return value ? value.substring(0, value.length-12) : null;
      },
      
      // Gets the current value of the localStorage without removing the duplicate buster.
      get_raw: function(channel){
        return localStorage.getItem('__pubsub__'+channel);
      },
      
      // Sets the localStorage value with the duplicate buster.
      set: function(channel, value){
        var val = value + Math.floor((Math.random()+1)*100000000000);                    // 12 digit random number
        console.log('set', channel, value, val);
        localStorage.setItem('__pubsub__'+channel, val);
      },
      
      // Triggers a custom event for the given channel.
      triggerEvent: function(channel, value){
        $(window).trigger('__pubsub__'+channel, value);   // remove the last 12 chars
      },
      
      // Binds the custom event.
      bindEvent: function(channel, callback){
        var cb = function(event, value){
          var v = value ? JSON.parse(value) : null;
          callback( v );
        };
        $(window).bind('__pubsub__'+channel, cb);
      },
      
      // Stupid at the first glance, but dumb browsers don't tell us the key so we have to
      // do this for them anyway.
      // And some browsers disrespect the localStorage spec and trigger the 'storage'-Event
      // even in the same window that makes the change.
      // This way we can prevent duplicate event triggers.
      findChangedChannel: function() {
        var changed_channel = false;
        
        $.each( PubSub.channels, function( stored_channel, known_content ){
          var storage_content = PubSub.storage.get_raw( stored_channel );
          console.log('findChangedChannel', stored_channel, known_content, storage_content);
          
          if( storage_content != known_content ) {
            PubSub.channels[stored_channel] = storage_content;
            
            changed_channel = stored_channel;
            return false; // break the each loop
          }
        });
        return changed_channel;
      },
      
      // Wraps the storage event to trigger our custom event (see above) if something changes we know of.
      eventHandler: function() {
        var channel = PubSub.storage.findChangedChannel();
        console.log('eventHandler', channel);
        
        if(!channel) { return false; }
        
        return PubSub.storage.triggerEvent(channel, PubSub.storage.get(channel));
      }
      
    }
    
  };
  
  if( window.addEventListener ) {
    window.addEventListener( 'storage', PubSub.storage.eventHandler, false );     // Fuer Firefox, Chrome, Safari und Opera
  } else {
    // IE triggert erst Event, macht dann den Storage-Eintrag.
    // Durch den timeout stellen wir sicher, dass der Storage-Eintrag da ist, wenn das Event feuert.
    document.attachEvent( 'onstorage', function(e){
      setTimeout( function(){PubSub.storage.eventHandler(e); }, 0) ;
    });
  }
  
});
