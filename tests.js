let CollectionX = new Mongo.Collection('x')
let CollectionY = new Mongo.Collection('y')
let CollectionZ = new Mongo.Collection('z')

if (Meteor.isServer) {
	Tinytest.add('Collection setup on server', function(test) {

		CollectionX.remove({})
		CollectionY.remove({})
		CollectionZ.remove({})

		_.range(5).forEach(it => CollectionX.insert({ it }))
		_.range(10).forEach(it => CollectionY.insert({ it }))
		_.range(15).forEach(it => CollectionZ.insert({ it }))

		test.equal(CollectionX.find().count(), 5, 'Collection X should hold 5 entries')
		test.equal(CollectionY.find().count(), 10, 'Collection Y should hold 10 entries')
		test.equal(CollectionZ.find().count(), 15, 'Collection Z should hold 15 entries')

		StaticSubs.publish('simplePub', function() {
			return CollectionX.find()
		})

		StaticSubs.publish('combinedPub', function() {
			return [
				CollectionY.find(),
				CollectionZ.find(),
			]
		})

		StaticSubs.publish('onReadyTest', function() {
			return []
		})
	})
}

if (Meteor.isClient) {
	Tinytest.addAsync('Subscription to simplePub is successful', function(test, next) {

		let sub = StaticSubs.subscribe('simplePub', function() {
			test.equal(sub.ready(), true, 'Simple subscription is ready')
			test.equal(CollectionX.find().count(), 5, 'Collection X should hold 5 entries')
			next()
		})

		test.equal(sub.ready(), false, 'Simple subscription is not ready')
	})

	Tinytest.addAsync('Subscription to combinedPub is successful', function(test, next) {

		let sub = StaticSubs.subscribe('combinedPub')

		test.equal(sub.ready(), false, 'Combined subscription is not ready')

		Tracker.autorun(() => {
			if (sub.ready()) {
				test.equal(CollectionY.find().count(), 10, 'Collection Y should hold 10 entries')
				test.equal(CollectionZ.find().count(), 15, 'Collection Z should hold 15 entries')
				next()
			}
		})
	})

	Tinytest.addAsync('Subscription callback `onReady` is invoked', function(test, next) {

		let cb = {
			onReady: () => {
				test.equal(true, true, '`onReady` is called')
				test.equal(sub.ready(), true, 'onReadyTest subscription is ready')
				next()
			},
		}
		let sub = StaticSubs.subscribe('onReadyTest', cb)

		test.equal(sub.ready(), false, 'onReadyTest subscription is not ready')
	})

	Tinytest.addAsync('Fail client subscription', function(test, next) {

		let cb = {
			onStop: (err) => {
				test.notEqual(err, undefined, 'Error must be returned')
				next()
			},
			onReady: (err) => {
				test.notEqual(err, undefined, 'Error must be returned')
				next()
			},
		}

		StaticSubs.subscribe('err', cb)
	})
}
