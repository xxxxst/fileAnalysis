<template>

<div class="content-back">
	<div class="select-range" :class="{'select-range-focus':isFocus}" >
		<div class="line" v-for="(it,idx) in selectMaskStyle" :key="idx" :style="it.style">
			<span v-for="(it2,idx2) in it.data" :key="idx2" :style="it2.style"></span>
		</div>
	</div>
	<div class="select-row" v-show="!isSelectRange()" :style="selectRowStyle"></div>
</div>

</template>

<script lang="ts">
import ctl from "./ContentBackTs";
export default ctl;
</script>

<style lang="scss">

.simple-monaco-editor .content-back {
	position: absolute; left: 0; top: 0; right: 0; height: 0; pointer-events: none;
	>.select-range {
		>.line {
			position: absolute; display: block;
			>span { position: absolute; display: inline-block; height: 100%; background: #3a3d41; }
		}
	}
	>.select-range-focus {
		>.line>span { background: #264f78; }
	}
	>.select-row { position: absolute; width: 100%; border: 2px solid #282828; }
}
</style>
