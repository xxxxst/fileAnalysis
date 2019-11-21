<template>

<div class="simple-monaco-editor" :style="rootStyle" @mouseover="onOver()" @mouseout="onOut()" @mousedown="onMousedown($event)" @mouseup="onMouseup($event)" @mousewheel="onMousewheel($event)">
	<div class="content-box" ref="contentBox">
		<div class="content" :style="contentStyle">
			<div class="edit-content" ref="editContent">
				<div class="edit-box" ref="editBox" :style="editBoxStyle">
					<div class="content-mask" ref="contentMask" @mousedown="onContentBoxMouseDownMask($event)"></div>
					<ContentBack ref="contBack"/>
					<ContentMain ref="contMain"/>
					<ContentFill ref="contFill"/>
				</div>
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
		>.content {
			position: absolute; width: 100%; top: 0; bottom: 0;
			>.edit-content {
				position: absolute; left: 37px; top: 0; right: 0; height: 100%; overflow: hidden;
				>.edit-box {
					position: absolute; left: 0; top: 0; right: 0; height: 100%;
					>.content-mask { cursor: text; position: absolute; left: 0; top: 0; bottom: 0; right: 0; overflow: hidden; }
				}
			}

			>.line-number { position: absolute; left: 0; top: 0; height: 100%; }
		}
	}
	>.slb-ver { position: absolute; top: 0; right: 0; height: 100%; width: 14px; }
	>.slb-hor { position: absolute; bottom: 0; left: 37px; right: 14px; height: 10px; }
}
</style>
