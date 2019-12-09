<template>

<div class="hex-view-fill">
	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="406" height="288">
		<g :transform="'translate(0.5,0.5)'">
			<template v-for="(it,idx) in renderData">
				<polyline v-for="(it2,idx2) in it.attrs" :key="idx+'_'+idx2" :points="it2.path"/>
			</template>

			<polyline class="over" v-for="(it,idx) in renderOverData" :key="'ov_'+idx" :points="it.path"/>
		</g>
	</svg>
</div>
</template>

<script lang="ts">
import ctl from "./HexViewFillTs";
export default ctl;
</script>

<style lang="scss">
@import "/src/assets/css/style.scss";

.hex-view-fill {
	width: 100%; height: 100%;
	polyline { fill:none; stroke:#e46d6d; stroke-width:1; }
	.over { stroke: #00f; }
}
</style>
