<template>

<div class="sm-scrollbar">
	<div class="content" :style="contentStyle" :class="{'content-over':model.isMouseOver,'content-hover':isDown}" @mousedown="onMousedown($event)"></div>
</div>
</template>

<script lang="ts">
import ctl from "./ScrollbarTs";
export default ctl;
</script>

<style lang="scss">

.sm-scrollbar {
	position: relative; border-left: 1px solid rgba(136, 136, 136, 0.5);

	>.content {
		position: absolute; display: inline-block;
		&:hover { background: rgba(122, 122, 122, 0.7); }
	}
	>.content-over {
		background: rgba(122, 122, 122, 0.4);
	}
	>.content-hover {
		background: rgba(122, 122, 122, 0.4);
	}
}
</style>
