<template>

<div class="hex-view-fill">
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="550" height="288">
		<g transform="translate(0.5,0.5)">
			<template v-for="(it,idx) in renderData">
				<polyline v-for="(it2,idx2) in it.attrs" :key="idx+'_'+idx2" :points="it2.path"/>
			</template>

			<polyline class="over" v-for="(it,idx) in renderOverData" :key="'ov_'+idx" :points="it.path"/>
		</g>
		<g transform="translate(409.5,0.5)" style="opacity:0.7;">
			<template v-for="(it,idx) in renderDataRight">
				<polyline v-for="(it2,idx2) in it.attrs" :key="idx+'_'+idx2" :points="it2.path"/>
			</template>

			<polyline class="over" v-for="(it,idx) in renderOverDataRight" :key="'ov_'+idx" :points="it.path"/>
		</g>
	</svg>
</div>
</template>

<script lang="ts">
import ctl from "./HexViewFillTs";
export default ctl;
</script>

<style lang="scss">
@import "@/assets/css/comStyle.scss";

.hex-view-fill {
	width: 100%; height: 100%;
	polyline { fill:none; stroke:#e46d6d; stroke-width:1; }
	.over { stroke: #00f; }
}
</style>
