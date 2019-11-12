<template>

<div class="content-main" @mousedown="onContentBoxMouseDownMainArea($event)">
	<div class="line" v-for="(it, idx) in lines" :key="idx" :style="lineStyle" :row="idx">
		<span v-for="(it2,idx2) in it.data" :key="idx2" :row="idx" :col="0" v-html="it2.renderVlaue"></span>
	</div>
</div>

</template>

<script lang="ts">
import ctl from "./ContentMainTs";
export default ctl;
</script>

<style lang="scss">

.simple-monaco-editor .content-main {
	position: absolute; left: 0; top: 0; width: 100%; height: 100%; cursor: text;
	color: #d4d4d4;
	>.line {
		display: block;
		>span { display: inline-block; height: 100%; white-space:nowrap; word-break:break-all; }
	}
}
</style>
