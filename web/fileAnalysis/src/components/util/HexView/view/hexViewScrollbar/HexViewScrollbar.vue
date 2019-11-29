<template>

<div class="hex-view-scrollbar">
	<div class="btn" :style="contentStyle"  @mousedown="onMousedown($event)"></div>
</div>
</template>

<script lang="ts">
import ctl from "./HexViewScrollbarTs";
export default ctl;
</script>

<style lang="scss">

.hex-view-scrollbar {
	position: relative; display: inline-block; width: 10px; height: 308px; border: 1px solid #acacac; border-left: 0; -webkit-user-select:none; user-select:none;

	>.btn {
		position: absolute; width: 100%; height: 0; left: 0; top: 0; border-radius: 5px; background: rgba(133, 133, 133, 0.6);
		&:hover { background: rgba(207, 207, 207, 0.87); }
	}
}
</style>
