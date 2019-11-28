<template>
<div class="hex-view" ref="dragFileBox" @mousewheel="onMousewheel($event)">
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
			<table>
				<thead>
					<tr>
						<th v-for="(it,idx) in lstHexHead" :key="idx" :width="it.width" :class="it.class" v-html="fhtml(it.desc)"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(it,idx) in lstHexData" :key="idx">
						<td v-for="(it2,idx2) in it" :key="idx2" :class="{'gray':it2=='00'}">{{it2}}</td>
					</tr>
				</tbody>
			</table>
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

		<!-- <div class="scrollbar">
			<div class="btn"></div>
		</div> -->
		<HexViewScrollbar ref="slbVer" :model="slbMd"/>

	</div>
	<div class="no-file-box" v-show="isWaitFile">
		<div class="content" :class="{'dragging':isDraggingFile}">
			<span>拖拽文件到这里</span>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import ctl from "./HexViewTs";
export default ctl;
</script>

<style>
@font-face {
	font-family: 'simsunspace';
	src: url('/static/font/simsunspace.ttf') format('truetype');
}
</style>


<style lang="scss">
@import "/src/assets/css/style.scss";

.hex-view {
	width: 100%; height: 100%;
	>.hex-content {
		width: 100%; height: 100%; padding: 4px; @extend %ex-one-line; overflow: hidden;
		>.table-box {
			display: inline-block; vertical-align: top;
			>table {
				border: 1px solid #acacac; font-size: 14px; font-family: 'Courier New', Courier, monospace;
				$rh: 17px;
				>thead {
					>tr { height: $rh+1px; }
					>tr>th { color: #973f93; height: $rh; line-height: $rh; font-weight: normal; }
				}
				>tbody {
					border-top: 1px solid #acacac;
					>tr{
						>td { padding: 0 4px; height: $rh; line-height: $rh; }
						// >td:first-child { color: #973f93; padding-left: 4px; border-right: 1px solid #acacac; }
						// >td:last-child { border-left: 1px solid #acacac; }
						.gray { color: #b1b1b1; }
					}
				}
				// .right { text-align: right; padding: 0 5px 0 0; }
				.col1 { border-right: 1px solid #acacac; }
				// .col-last { border-left: 1px solid #acacac; }
				.title { color: #973f93; padding-left: 4px; }
			}
			// &:first-child {
			// 	>tbody>tr>td:first-child { color: #973f93; padding-left: 4px; border-right: 1px solid #acacac; }
			// }
		}
		.table-box+.table-box>table { border-left: 0; }

		>.scrollbar {
			position: relative; display: inline-block; width: 10px; height: 292px; border: 1px solid #acacac; border-left: 0; @extend %ex-no-select;
			>.btn {
				position: absolute; width: 100%; height: 40px; left: 0; top: 0; border-radius: 5px; background: rgba(133, 133, 133, 0.6);
				&:hover { background: rgba(207, 207, 207, 0.87); }
			}
		}
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
