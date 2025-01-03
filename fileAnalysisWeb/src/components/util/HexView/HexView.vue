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
						<th v-for="(it,idx) in lstHexHead" :key="idx" :width="it.width" :class="it.class" v-html="it.desc"></th>
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
		<div class="table-box table-text">
			<table>
				<thead>
					<tr>
						<th width="150px">
							<div class="btn-box">
								<a-popconfirm overlayClassName="hex-view-popconfirm-jump" :icon="' '" okText="Jump" @confirm="onClickJump">
									<template slot="title">
										<div class="box">
											<div class="input-box"><div class="tag">0x</div><input type="text" v-model="strJump" v-noSpell></div>
										</div>
									</template>
									<div class="btn" title="跳转">J</div>
								</a-popconfirm>
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(it,idx) in lstHexText" :key="idx">
						<td class="td-text" v-html="it"></td>
					</tr>
				</tbody>
			</table>
			<div class="select-hide-fill"></div>
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
@import "@/assets/css/comStyle.scss";

.hex-view-popconfirm-jump {
	font-size: 12px;
	.ant-popover-inner-content { padding: 8px; }
	.ant-popover-message-title { padding: 0; }
	.ant-popover-inner-content {
		@extend %ex-one-line;
		>.ant-popover-message { display: inline-block; padding: 0; }
	}
	.box {
		display: inline-block; vertical-align: top;
		>.input-box {
			position: relative; width: 100px; height: 22px; border: 1px solid #9c9c9c;
			>.tag { pointer-events: none; position: absolute; left: 2px; top: 0; color: #a1a1a1; }
			>input { width: 100%; height: 100%; padding-left: 17px; border: 0; background: transparent; }
		}
	}
	.ant-popover-buttons {
		display: inline-block; vertical-align: top;
		>button:first-child { display: none; }
	}
}

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
						>.td-text { text-align: justify; }
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
		>.table-text {
			width: 144px; overflow: hidden;
			.btn-box {
				position: relative; height: 100%; font-size: 12px; color: #000; text-align: left; padding-left: 4px;
				>.btn {
					cursor: pointer; display: inline-block; width: 14px; height: 14px; line-height: 14px; border: 1px solid #5a5a5a; margin-top: 2px; text-align: center; vertical-align: top;
					&:hover { background: #e9e9e9; }
				}
			}
			>.select-hide-fill { width: 5px; }
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
