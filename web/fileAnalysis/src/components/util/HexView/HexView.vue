<template>
<div class="hex-view" ref="dragFileBox" tabindex="0" @mousewheel="onMousewheel($event)" @keydown="onKeydown($event)">
	<div class="hex-content" v-show="!isWaitFile">
		<div class="table-box">
			<table>
				<thead>
					<tr>
						<th class="col1" width="80px">address</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(it,idx) in lstAddr" :key="idx">
						<td class="title">{{it}}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- data -->
		<div class="table-box">
			<table class="data">
				<thead>
					<tr>
						<th v-for="(it,idx) in lstHexHead" :key="idx" :width="it.width" :class="it.class" v-html="fhtml(it.desc)"></th>
					</tr>
				</thead>
				<tbody>
					<tr></tr>
					<tr v-for="(it,idx) in lstHexData" :key="idx">
						<td v-for="(it2,idx2) in it" :key="idx2" :class="{'gray':it2=='00'}"><span v-html="it2"></span></td>
					</tr>
				</tbody>
			</table>
			<div class="select-hide-fill"></div>
		</div>

		<!-- text -->
		<div class="table-box">
			<table>
				<thead>
					<tr>
						<th width="150px"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(it,idx) in lstHexText" :key="idx">
						<td v-html="fhtml(it)"></td>
					</tr>
				</tbody>
			</table>
		</div>

		<HexViewScrollbar ref="slbVer" :model="slbMd"/>

	</div>
	<div class="no-file-box" v-show="isWaitFile">
		<div class="content" :class="{'dragging':isDraggingFile}">
			<span>Drag file here</span>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import ctl from "./HexViewTs";
export default ctl;
</script>

<style lang="scss">
@import "/src/assets/css/style.scss";

.hex-view {
	width: 100%; height: 100%;
	>.hex-content {
		width: 100%; height: 100%; padding: 4px; @extend %ex-one-line; overflow: hidden;
		>.table-box {
			position: relative; display: inline-block; height: 308px; border: 1px solid #acacac; vertical-align: top;
			$rh: 18px;
			>table {
				font-size: 14px; font-family: 'Courier New', Courier, monospace;
				>thead {
					>tr { height: $rh+1px; }
					>tr>th { color: #973f93; height: $rh; line-height: $rh - 1px; font-weight: normal; vertical-align: top; }
				}
				>tbody {
					border-top: 1px solid #acacac;
					>tr{
						>td { padding: 0 4px; height: $rh; line-height: $rh - 1px; vertical-align: top; }
						.gray { color: #b1b1b1; }
					}
				}
				.title { color: #973f93; padding-left: 4px; }
			}
			>.data>tbody>tr:first-child { height: 0; }
			>.data>tbody>tr>td:first-child { text-align: right; }
			>.select-hide-fill { pointer-events: none; position: absolute; top: 20px; right: 0; bottom: 1px; width: 8px; background: #fff; }

		}
		.table-box+.table-box { border-left: 0; }

	}
	>.no-file-box {
		position: absolute; width: 100%; height: 100%; left: 0; top: 0; @extend %flex-center;
		>.content { 
			pointer-events: none; width: 300px; height: 160px; border: 1px dashed #7e7e7e; border-radius: 8px; @extend %flex-center;
		}
		>.dragging { background: #e4e4e4; }
	}
}
</style>
