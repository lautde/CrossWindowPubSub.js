external_window = window.open('external.html', 'externalwindow', 'width=800,height=800,left=0,top=0');

window.localStorage.clear();

jQuery(function( $ ) {

QUnit.config.autostart = false; // tests are started when the external window is loaded.

QUnit.done(function(){
  // external_window.close();
});

// remote tests
module( "remote");

      test('value()', function(){
        var msg = 'test' + Math.random();
        var channel = 'test' + Math.random();
        
        external_window.PubSub.publish(channel, msg);
        equal(PubSub.value(channel), msg, 'is the value of the last pub');
        equal(PubSub.value('unknown'), null, 'is null if never pubbed');
      });
      
      asyncTest('simple subscribe()', function(){
        var msg = 'test' + Math.random();
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, msg, 'it receives the message');
        });
        
        external_window.PubSub.publish(channel, msg);
      });
      
      asyncTest('subscribe() with boolean true', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, true, 'it receives the boolean true');
        });
        
        external_window.PubSub.publish(channel, true);
      });
      
      asyncTest('subscribe() with boolean false', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, false, 'it receives the boolean false');
        });
        
        external_window.PubSub.publish(channel, false);
      });
      
      asyncTest('subscribe() with a number', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, 42, 'it receives the number 42');
        });
        
        external_window.PubSub.publish(channel, 42);
      });
      
      asyncTest('subscribe() with an array', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          deepEqual(result, [1,2,3], 'it receives the array [1,2,3]');
        });
        
        external_window.PubSub.publishJson(channel, '[1,2,3]');
      });
      
      asyncTest('subscribe() with an object', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          deepEqual(result, {'a': 1, 'b': 2}, "it receives the object {'a': 1, 'b': 2}");
        });
        
        external_window.PubSub.publishJson(channel, '{"a": 1, "b": 2}');
      });
      
      asyncTest('subscribe() with the msg twice', function(){
        var msg = 'test' + Math.random();
        var channel = 'test' + Math.random();
        external_window.PubSub.publish(channel, msg);
        
        equal(PubSub.value(channel), msg, 'the value is set before the test');
        
        // be sure to subscribe _after_ the first publish.
        setTimeout(function(){
          PubSub.subscribe(channel, function(result){
            start();
            equal(result, msg, 'it receives the same message twice');
          });
          
          external_window.PubSub.publish(channel, msg);
        }, 100);
      });
      
      asyncTest('unsubscribe() stops subscription', function(){
        var msg = 'test' + Math.random();
        var channel1 = 'test' + Math.random();
        var channel2 = 'test' + Math.random();
        external_window.PubSub.publish(channel1, msg);
        
        PubSub.subscribe(channel1, function(result){
          equal(true, false, 'this should never occur');
        });
        PubSub.subscribe(channel2, function(result){
          start();
          equal(result, msg, 'this channel still works');
        });
        
        PubSub.unsubscribe(channel1);
        
        external_window.PubSub.publish(channel1, msg);
        external_window.PubSub.publish(channel2, msg);
      });
      
      
      asyncTest('frequenz', function(){
        var msg = 'test' + Math.random();
        var channel = 'test' + Math.random();
        var pub_counter = 0;
        var sub_counter = 0;
        var count = 100;
        var interval = 30;
        
        var timer = setInterval(function(){
          pub_counter++;
          console.log('pub', pub_counter);
          external_window.PubSub.publish(channel, 'foo');
          if(pub_counter == count){
            clearInterval(timer);
            setTimeout(function(){
              start();
              equal(sub_counter, count, 'gets all the messages: '+sub_counter+'/'+count);
            }, 100);
          };
        }, interval);
        
        PubSub.subscribe(channel, function(result){
          sub_counter++;
          console.log('sub', sub_counter);
        });
      });


// local tests
module('local');

      asyncTest('simple subscribe()', function(){
        var msg = 'test' + Math.random();
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, msg, 'it receives the message');
        });
        
        PubSub.publish(channel, msg);
      });
      
      asyncTest('subscribe() with the msg twice', function(){
        var msg = 'test' + Math.random();
        var channel = 'test' + Math.random();
        PubSub.publish(channel, msg);
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, msg, 'it receives the same message twice');
        });
        
        PubSub.publish(channel, msg);
      });
      
      asyncTest('subscribe() with boolean true', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, true, 'it receives the boolean true');
        });
        
        PubSub.publish(channel, true);
      });
      
      asyncTest('subscribe() with boolean false', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, false, 'it receives the boolean false');
        });
        
        PubSub.publish(channel, false);
      });
      
      asyncTest('subscribe() with a number', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          equal(result, 42, 'it receives the number 42');
        });
        
        PubSub.publish(channel, 42);
      });
      
      asyncTest('subscribe() with an array', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          deepEqual(result, [1,2,3], 'it receives the array [1,2,3]');
        });
        
        PubSub.publish(channel, [1,2,3]);
      });
      
      asyncTest('subscribe() with an object', function(){
        var channel = 'test' + Math.random();
        
        PubSub.subscribe(channel, function(result){
          start();
          deepEqual(result, {'a': 1, 'b': 2}, "it receives the object {'a': 1, 'b': 2}");
        });
        
        PubSub.publish(channel, {'a': 1, 'b': 2});
      });
      
      asyncTest('unsubscribe() stops subscription', function(){
        var msg = 'test' + Math.random();
        var channel1 = 'test' + Math.random();
        var channel2 = 'test' + Math.random();
        PubSub.publish(channel1, msg);
        
        PubSub.subscribe(channel1, function(result){
          equal(true, false, 'this should never occur');
        });
        PubSub.subscribe(channel2, function(result){
          start();
          equal(result, msg, 'this channel still works');
        });
        
        PubSub.unsubscribe(channel1);
        
        PubSub.publish(channel1, msg);
        PubSub.publish(channel2, msg);
      });
      
      asyncTest('frequenz', function(){
        var msg = 'test' + Math.random();
        var channel = 'test' + Math.random();
        var pub_counter = 0;
        var sub_counter = 0;
        var count = 100;
        var interval = 1;
        
        var timer = setInterval(function(){
          pub_counter++;
          PubSub.publish(channel, 'foo');
          if(pub_counter == count){
            clearInterval(timer);
            setTimeout(function(){
              start();
              equal(sub_counter, count, 'gets all the messages: '+sub_counter+'/'+count);
            }, 100);
          };
        }, interval);
        
        PubSub.subscribe(channel, function(result){
          sub_counter++;
        });
      });
      
});
