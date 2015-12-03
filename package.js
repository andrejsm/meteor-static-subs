Package.describe({
	name: 'ouk:static-subs',
	version: '1.0.0',
	summary: 'Static subscriptions',
	git: 'https://github.com/andrejsm/meteor-event-bus',
	documentation: 'README.md',
})

Package.onUse(function(api) {
	api.versionsFrom('1.2.1')
	api.export('StaticSubs')

	api.use('ecmascript')
	api.use('underscore')
	api.use('reactive-var')
	api.use('ejson')
	api.use('check')

	api.addFiles('server.js', ['server'])
	api.addFiles('client.js', ['client'])
})

Package.onTest(function(api) {
	api.use('ecmascript')
	api.use('tinytest')
	api.use('mongo')
	api.use('underscore')
	api.use('tracker')
	api.use('ouk:static-subs')
	api.addFiles('tests.js')
})
