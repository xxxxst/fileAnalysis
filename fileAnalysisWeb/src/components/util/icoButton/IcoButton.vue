<template>
<div class="ico-button" :title="title" :style="{width:size/remUnit+'rem', height:size/remUnit+'rem', padding:padding/remUnit+'rem'}" @click="onClick($event)" v-vhover="'isOver'">
	<div class="img" :class="className" v-vstyle="iconStyle"></div>
</div>
</template>

<script lang="ts">
import ctl from './IcoButtonTs';

export default ctl;
</script>

<style lang="scss">
@import "@/assets/css/comStyle.scss";

.ico-button {
	cursor: pointer; position: relative; display: inline-block; vertical-align: top;
}
</style>
