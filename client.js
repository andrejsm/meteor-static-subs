StaticSubs = {}

/**
 * Returns a handle with `ready()` method to determine state of subscription.
 *
 * @param {String} name Name of the subscription.  Matches the name of the server's `publish()` call.
 * @param {Any} [arg1,arg2...] Optional arguments passed to publisher function on server.
 * @param {Function|Object} [callbacks] Optional. May include `onStop`
 * and `onReady` callbacks. If there is an error, it is passed as an
 * argument to `onStop`. If a function is passed instead of an object, it
 * is interpreted as an `onReady` callback.
 * @returns {{ready: ready}}
 */
StaticSubs.subscribe = function(/* name [, arg1, arg2, ...] [, callbacks] */) {
	let isReady = new ReactiveVar(false)
	let args = _.toArray(arguments)
	let last = _.last(args)
	let cb

	if (_.isFunction(last) || (_.isFunction(last.onReady) || _.isFunction(last.onStop))) {
		args.pop()
		cb = last
	}

	let done = (err, resp) => {
		if (err) {
			if (cb && cb.onStop) {
				return cb.onStop(err)
			}

			throw err
		}

		_.each(EJSON.parse(resp), (data, colName) => {
			let col = Meteor.connection._stores[colName]
			let makeMessage = makeMessageFor(colName)
			data.forEach(it => col.update(makeMessage(it)))
		})

		isReady.set(true)

		if (cb && cb.onReady) {
			cb.onReady()
		}
		else if (_.isFunction(cb)) {
			cb()
		}
	}

	Meteor.call(...['__ouk:static-subs__retrieve__', ...args, done])

	return {
		ready: () => isReady.get(),
	}
}

let makeMessageFor = colName => it => {
	return {
		msg: 'added',
		collection: colName,
		id: it._id,
		fields: _.omit(it, '_id'),
	}
}
