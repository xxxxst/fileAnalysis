<template>

<div class="map-preview">
	<!-- <svg xmlns="http://www.w3.org/2000/svg" version="1.1" :width="svgWidth" :height="svgHeight">
		<g>
			
		</g>
	</svg> -->

	<div class="content">
		<div class="item" v-for="(it,idx) in renderData" :key="idx" :style="{left:it.left+'px', top:it.top+'px'}">
			<div class="head">{{it.name}}</div>
			<div class="row" v-for="(it2,idx2) in it.attrs" :key="idx2">{{it2.name}}</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import ctl from "./MapPreviewTs";
export default ctl;
</script>

<style lang="scss">
@import "/src/assets/css/style.scss";

.map-preview {
	width: 100%; height: 100%; overflow: auto; @extend %ex-no-select; @include scrollbar(4px);
	>.content {
		>.item {
			cursor: default; position: absolute; display: inline-block; font-size: 12px; border: 1px solid #000;
			>.head,>.row { height: 20px; line-height: 18px; padding: 0 4px; }
			>.head { font-weight: bold; background: #f0f0f0; }
			>div+div { border-top: 1px solid #000; }
			// >.row { height: 16px; line-height: 16px; }
		}
	}

}
</style>
