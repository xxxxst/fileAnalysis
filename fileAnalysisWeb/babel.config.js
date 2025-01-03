
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

var plugins = [];
if (IS_PROD) {
	plugins.push(['transform-remove-console', {exclude: ['error', 'warn', 'info']}]);
}

plugins.push(['import', {
	'libraryName': 'ant-design-vue',
	'libraryDirectory': 'es',
	'style': true
}])

module.exports = {
	presets: [
		'@vue/cli-plugin-babel/preset',
	],
	plugins
};
