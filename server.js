StaticSubs = {}
/**
 * NOTE publication does not have `this.userId`
 *
 * @param {String} name Name of the record set.
 * @param {Function} func Function called on the server each time a client subscribes.
 * If the client passed arguments to `subscribe`, the function is called with the same arguments.
 */
StaticSubs.publish = function(name, func) {
	pubStore[name] = func
}

let pubStore = {}
let toEJSON = cursor => {
	if (!Array.isArray(cursor)) {
		cursor = [cursor]
	}

	let data = {}
	_.each(cursor, it => data[it._cursorDescription.collectionName] = it.fetch())

	return EJSON.stringify(data)
}

Meteor.methods({
	'__ouk:static-subs__retrieve__': function() {
		let [ pub, ...args ] = [...arguments]
		try {
			return toEJSON(pubStore[pub](...args))
		}
		catch (e) {
			throw new Meteor.Error('' + e)
		}
	},
})
