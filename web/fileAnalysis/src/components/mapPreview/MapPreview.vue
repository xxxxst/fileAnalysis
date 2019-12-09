<template>

<div class="map-preview" @click="onClickBack($event)">
	<div class="content">
		<div class="item" v-for="(it,idx) in renderData" :key="idx" :style="{left:it.left+'px', top:it.top+'px'}">
			<div class="row" v-for="(it2,idx2) in it.data" :key="idx2" :class="{'head':idx2==0}">
				<div class="col" v-for="(it3,idx3) in it2" :key="idx3" @click="onClickData(idx, idx2, idx3)" @mouseover="onOverData(idx, idx2, idx3)" @mouseout="onOutData()">{{it3}}</div>
			</div>
		</div>
		<div class="select-item" :style="selectDataStyle"></div>
		<div class="over-item" :style="overDataStyle"></div>
		<div class="bottom" :style="{top: bottomY + 'px'}"></div>
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
			$bd: 1px solid #929292;
			cursor: default; position: absolute; display: inline-block; font-size: 12px; border: $bd;
			// >.head,>.row { height: 20px; line-height: 18px; padding: 0 4px; }
			>.head { font-weight: bold; background: #f0f0f0; }
			>div+div { border-top: $bd; }
			// >.row { height: 16px; line-height: 16px; }

			>.row {
				height: 20px; line-height: 18px;
				>.col { display: inline-block; width: 80px; height: 100%; padding: 0 6px; overflow: hidden; }
				>.col:first-child { width: 100px; }
				>.col+.col { border-left: $bd; }
			}
		}
		>.over-item,>.select-item { pointer-events: none; position: absolute; display: inline-block; }
		>.select-item { border: 1px solid #5858ff; }
		>.over-item { border: 1px solid #00f; }
		>.bottom { pointer-events: none; position: absolute; left: 0; width: 100%; height: 50px; }
	}

}
</style>
