
const Fs = require("fs");

(function() {
	const coRed = "\x1b[31m";
	const coCyan = "\x1b[36m";
	const coReset = "\x1b[37m";

	if(process.argv.length < 3) {
		console.info(`createComp.bat ${coCyan}[component directory path]${coReset}`);
		return;
	}

	var path = process.argv[2];

	if(!Fs.existsSync(path) || !Fs.lstatSync(path).isDirectory() ) {
		console.info(`${coRed}Directory not exist${coReset}`);
		return;
	}

	path = path.replace(/[/\\]+/g, "/").replace(/\/$/, "");
	var dirName = path.replace(/.*\/([^\/]+)/, "$1");

	var className = dirName.charAt(0).toUpperCase() + dirName.substr(1);
	var cssName = dirName.replace(/([A-Z]+)/g, "-$1").toLowerCase();

	var vueFilePath = path + "/" + className + ".vue";
	var tsFilePath = path + "/" + className + "Ts.ts";

	if(Fs.existsSync(vueFilePath)) {
		console.info(`${coRed}File exist${coReset}<${vueFilePath}>`);
		return;
	}
	
	if(Fs.existsSync(tsFilePath)) {
		console.info(`${coRed}File exist${coReset}<${tsFilePath}>`);
		return;
	}

	Fs.writeFileSync(vueFilePath, `<template>
<div class="${cssName}">
</div>
</template>

<script lang="ts">
import ctl from "./${className}Ts";
export default ctl;
</script>

<style lang="scss">
@import "@/assets/css/comStyle.scss";

.${cssName} {
	position: relative; width: 100%; height: 100%;
}
</style>
`.replace(/(\r\n)|(\n)/g, "\r\n"));


	Fs.writeFileSync(tsFilePath, `
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

@Comp({ })
export default class ${className} extends Vue {

	created() {
		
	}

	mounted() {

	}

}
`.replace(/(\r\n)|(\n)/g, "\r\n"));

})();