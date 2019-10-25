<template>

<div class="sm-line-number-box">
	<div class="line" :style="linStyle" v-for="(it, idx) in lstLines" :key="idx">
		<div class="no" :class="{'active':it==model.activeLine+1}" :style="noStyle">{{it}}</div>
	</div>
</div>
</template>

<script lang="ts">
import ctl from "./LineNumberBoxTs";
export default ctl;
</script>

<style lang="scss">

.sm-line-number-box {
	display: inline-block; width: 37px;
	.line {
		.no { display: inline-block; color: #fff; text-align: right; color: #858585; }
		.active { color: #d4d4d4; }
	}
}
</style>
