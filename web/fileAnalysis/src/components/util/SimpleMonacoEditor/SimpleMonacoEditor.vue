<template>

<div class="simple-monaco-editor" :style="rootStyle" @mouseover="onOver()" @mouseout="onOut()" @mousedown="onMousedown($event)" @mouseup="onMouseup($event)" @mousewheel="onMousewheel($event)">
	<div class="content-box" ref="contentBox">
		<div class="content-mask" ref="contentMask" @mousedown="onContentBoxMouseDownMask($event)"></div>
		<div class="content" :style="contentStyle">
			<div class="edit-box">
				<div class="content-back">
					<div class="select-range" :class="{'select-range-focus':isFocus}" >
						<div class="line" v-for="(it,idx) in selectMaskStyle" :key="idx" :style="it.style">
							<span v-for="(it2,idx2) in it.data" :key="idx2" :style="it2.style"></span>
						</div>
					</div>
					<div class="select-row" v-show="!isSelectRange()" :style="selectRowStyle"></div>
				</div>
				<div class="content-main" ref="contentMain" @mousedown="onContentBoxMouseDownMainArea($event)">
					<div class="line" v-for="(it, idx) in lines" :key="idx" :style="lineStyle" :row="idx">
						<span v-for="(it2,idx2) in it.data" :key="idx2" :row="idx" :col="0" v-html="it2.renderVlaue"></span>
					</div>
				</div>
				<div class="content-fill">
					<textarea class="input" :class="{'input-ime':isIMEStart}" :style="textareaStyle" v-model="textInput" v-noSpell ref="textarea" v-show="!option.readOnly" @blur="onTextareaBlur()"/>
					<div class="cursor" :class="{'cursor-flash':isFocus&&!cursorHold&&!option.readOnly}" :style="cursorStyle"></div>
					<span class="char-test" ref="charTest">a</span>
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

@keyframes aniCursorFlash {
	0% { opacity: 1; }
	49% { opacity: 1; }
	50% { opacity: 0; }
	99% { opacity: 0; }
	100% { opacity: 1; }
}

.simple-monaco-editor {
	position: relative; background: #1e1e1e; font-feature-settings: "liga" off, "calt" off; letter-spacing: 0; -webkit-user-select:none; user-select:none;
	// >.content, >.content-fill { position: absolute; left: 37px; top: 0; bottom: 0; right: 0; }
	>.content-box {
		position: absolute; left: 0; top: 0; bottom: 0; right: 0; overflow: hidden;
		>.content-mask { cursor: text; position: absolute; left: 37px; top: 0; bottom: 0; right: 0; overflow: hidden; }
		>.content {
			// position: absolute; width: 10000px; height: 100000px;
			position: absolute; width: 100%; height: 0;
			>.edit-box {
				position: absolute; left: 37px; top: 0; right: 0; height: 100%;
				>.content-back {
					position: absolute; left: 0; top: 0; right: 0; height: 0; pointer-events: none;
					>.select-range {
						>.line {
							position: absolute; display: block;
							>span { position: absolute; display: inline-block; height: 100%; background: #3a3d41; }
						}
					}
					>.select-range-focus {
						>.line>span { background: #264f78; }
					}
					>.select-row { position: absolute; width: 100%; border: 2px solid #282828; }
				}
				>.content-main {
					position: absolute; left: 0; top: 0; width: 100%; height: 100%; cursor: text;
					color: #d4d4d4;
					>.line {
						display: block;
						>span { display: inline-block; height: 100%; }
					}
				}
				>.content-fill {
					position: absolute; left: 0; top: 0; right: 0; height: 0;
					>.input { position: absolute; width: 1px; height: 1px; color: transparent; background: transparent; margin: 0; padding: 0; border: 0; letter-spacing:0; overflow: hidden; white-space:nowrap; word-break:break-all; }
					>.input-ime { color: #fff; }
					// >.input { position: absolute; width: 20px; height: 20px; color: #000; background: #fff; margin: 0; padding: 0; border: 0; overflow: hidden; white-space:nowrap; letter-spacing: 0; }
					>.cursor { position: absolute; display: inline-block; width: 2px; background: #aeafad; pointer-events: none; }
					>.cursor-flash { animation: aniCursorFlash 1s linear 0s infinite; }
					>.cursor-hold { opacity: 1; }
					>.char-test { color: transparent; pointer-events: none; }
				}
			}
			>.line-number { position: absolute; left: 0; top: 0; height: 100%; }
		}
	}
	>.slb-ver { position: absolute; top: 0; right: 0; height: 100%; width: 14px; }
	>.slb-hor { position: absolute; bottom: 0; left: 0; right: 14px; height: 14px; }
	// >.input { position: absolute; width: 30px; height: 30px; margin: 0; padding: 0; border: 0; }
}
</style>
