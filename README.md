# Static subscriptions

Fetch data for client just once. Any changes in database will not be reflected on client.
Useful to fetch theoretically and practically static data.

Signature of `Meteor.publish/subscribe` is retained. `publish` function does not have `this.userId` prop.

Data received via this package is not flushed when publication gets invalidated on server.
Use this package to retrieve public data only. For example, blog posts, categories of posts, any data accessible by guests.

If you have subscribed to sensitive data related to `userId` then flush it by yourself.


## Installation
```sh
meteor add ouk:static-subs
```


## API

Package exports `StaticSubs` variable

#### `StaticSubs.publish(name, func)`
Server side function to register publication
```
NOTE publication does not have `this.userId`

@param {String} name Name of the record set.
@param {Function} func Function called on the server each time a client subscribes.
If the client passed arguments to `subscribe`, the function is called with the same arguments.
```

#### `StaticSubs.subscribe(name [, arg1, arg2, ...] [, callbacks])`
Client side function to register publication
```
Returns a handle with `ready()` method to determine state of subscription.

@param {String} name Name of the subscription.  Matches the name of the server's `publish()` call.
@param {Any} [arg1,arg2...] Optional arguments passed to publisher function on server.
@param {Function|Object} [callbacks] Optional. May include `onStop`
and `onReady` callbacks. If there is an error, it is passed as an
argument to `onStop`. If a function is passed instead of an object, it
is interpreted as an `onReady` callback.
@returns {{ready: ready}}
```


## Usage 

Package should be used only to publish insecure data.
Do not use this package to subscribe to data related with `userId`.

On server
```js
StaticSubs.publish('posts', function(page) {
	check(page, Number)
	return Posts.find({}, { limit: 10, offset: page * 10 - 10 })
})
```

On client
```js
let sub = StaticSubs.subscribe('posts', 1)

Tracker.autorun(() => {
	if (sub.ready()) {
		console.log(Posts.find().count())	
	}
})
```
