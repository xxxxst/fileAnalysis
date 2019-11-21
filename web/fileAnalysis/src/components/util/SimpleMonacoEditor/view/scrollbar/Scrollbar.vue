<template>

<div class="sm-scrollbar" :style="{borderLeft:model.isVertical?'1px solid rgba(136, 136, 136, 0.5)':''}">
	<div class="content" :style="contentStyle" :class="{'content-over':model.isMouseOver,'content-hover':isDown}" @mousedown="onMousedown($event)"></div>
</div>
</template>

<script lang="ts">
import ctl from "./ScrollbarTs";
export default ctl;
</script>

<style lang="scss">

.sm-scrollbar {
	position: relative;

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
