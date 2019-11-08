<template>

<div class="simple-monaco-editor" :style="rootStyle" @mouseover="onOver()" @mouseout="onOut()" @mousedown="onMousedown($event)" @mouseup="onMouseup($event)" @mousewheel="onMousewheel($event)">
	<div class="content-box" ref="contentBox">
		<div class="content-mask" ref="contentMask" @mousedown="onContentBoxMouseDownMask($event)"></div>
		<div class="content" :style="contentStyle">
			<div class="edit-box">
				<ContentBack ref="contBack"/>
				<ContentMain ref="contMain"/>
				<ContentFill ref="contFill"/>
			</div>
			<LineNumberBox class="line-number" :model="lineNoMd"/>
		</div>
	</div>

	<Scrollbar class="slb-ver" :model="verSlbMd" ref="slbVer"/>
	<Scrollbar class="slb-hor" :model="horSlbMd" v-show="isShowScrollbar(horSlbMd)" ref="slbHor"/>
</div>
</template>

<script lang="ts">
import ctl from "./SimpleMonacoEditorTs";
export default ctl;
</script>

<style lang="scss">

.simple-monaco-editor {
	position: relative; background: #1e1e1e; font-feature-settings: "liga" off, "calt" off; letter-spacing: 0; -webkit-user-select:none; user-select:none;
	>.content-box {
		position: absolute; left: 0; top: 0; bottom: 0; right: 0; overflow: hidden;
		>.content-mask { cursor: text; position: absolute; left: 37px; top: 0; bottom: 0; right: 0; overflow: hidden; }
		>.content {
			position: absolute; width: 100%; height: 0;
			>.edit-box {
				position: absolute; left: 37px; top: 0; right: 0; height: 100%;
			}
			>.line-number { position: absolute; left: 0; top: 0; height: 100%; }
		}
	}
	>.slb-ver { position: absolute; top: 0; right: 0; height: 100%; width: 14px; }
	>.slb-hor { position: absolute; bottom: 0; left: 0; right: 14px; height: 14px; }
}
</style>
