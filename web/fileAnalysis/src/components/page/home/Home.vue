<template>

<div class="home" v-show="isInited">
	<div class="top-box">
		<div class="item" v-show="!isStaticMode" @click="onSaveToServer()"><span>{{'Save' + (needSaveToServer ? "\n*" : "")}}</span></div>
		<div class="item" v-show="isStaticMode"><span>Load</span><div class="file-box"><input type="file" accept=".json" ref="fileData" @change="onLoadData($event)"></div></div>
		<div class="item" @click="onDownloadData()"><span>{{'Download' + (isStaticMode&&needSaveToServer ? "\n*" : "")}}</span></div>
	</div>
	
	<!-- parser -->
	<div class="tree-box tree-parser" v-if="!selectStructInfo">
		<div class="head">
			<div class="left-box">
				<img class="ico" src="static/image/select.png" alt="">
			</div>
			<div class="title">Select Parser</div>
			<div class="right-box">
				<img class="btn" src="static/image/add.png" alt="" title="add parser" @click="onClickAddParser()">
				<img class="btn" src="static/image/edit.png" alt="" title="edit" @click="onClickMenuEdit()">
			</div>
		</div>
		<div class="content">
			<div class="item" v-for="(it,idx) in lstFileStruct" :key="idx">
				<div class="lbl" @click="onClickParser(it)">{{it.name}}</div>
				<div class="input-box" v-show="isEditTree">
					<input type="text" :ref="'muParserInput_' + idx" v-model="it.name" v-noSpell @change="onChangeParserName()" @keyup.enter="onEnterParserName()">
				</div>
				<div class="ctl-box" v-show="isEditTree">
					<div class="ok-box" v-if="idx==confirmDeleteIdx" @click="onClickMenuItemDeleteSure()">Del</div>
					<img class="btn" src="static/image/delete.png" alt="" @click="onClickMenuItemDelete(idx)">
				</div>
			</div>
		</div>
	</div>
	
	<!-- structs -->
	<div class="tree-box tree-struct" v-if="selectStructInfo">
		<div class="head">
			<div class="left-box">
				<img class="btn" src="static/image/back.png" alt="" @click="onClickBack()">
			</div>
			<div class="title">{{selectStructInfo.name}}</div>
			<div class="right-box">
				<img class="btn" src="static/image/add.png" alt="" title="add struct" @click="onClickAddStruct()">
				<img class="btn" src="static/image/edit.png" alt="" title="edit" @click="onClickMenuEdit()">
				<!-- <div class="lbl-btn" :class="{'select':isShowStructView}" title="view struct" @click="onClickShowHideStructView()">C</div> -->
			</div>
		</div>
		<!-- <div class="tree-content" v-show="!isShowStructView">
			<div class="item" v-for="(it,idx) in selectStructInfo.routes" :key="idx" :class="{'select':selectRootStruct===it}" @click="onClickRootStruct(it)">{{it.name + ((selectRootStruct===it&&editText!=originText) ? ' *':'')}}</div>
		</div> -->
		<div class="content">
			<div class="top-ctl-box">
				<div class="btn" :class="{'select':isSelectAddress}" @click="onClickAddressBtn()">{{'Address' + ((selectStructInfo && selectStructInfo.address!=selectStructInfo.editAddress) ? "*" : "&ensp;")}}</div>
			</div>

			<div class="item" v-for="(it,idx) in selectStructInfo.structs" :key="idx" :class="{'select':selectStruct===it}">
				<div class="lbl" @click="onClickStruct(it)">{{it.name + (it.textCache != it.editCache ? ' *':'')}}</div>
				<div class="ctl-box" v-show="isEditTree">
					<div class="ok-box" v-if="idx==confirmDeleteIdx" @click="onClickMenuItemDeleteSure()">Del</div>
					<img class="btn" src="static/image/delete.png" alt="" @click="onClickMenuItemDelete(idx)">
				</div>
			</div>
			<!-- <div class="item" v-for="(it,idx) in selectStructInfo.structs" v-show="!isShowStructView" :key="'a'+idx" :class="{'select':selectStruct===it}" @click="onClickStruct(it)">{{it.name + (it.textCache != it.editCache ? ' *':'')}}</div> -->
			<!-- <div class="item" v-for="(it,idx) in selectStructInfo.structs" v-show="isShowStructView" :key="'b'+idx" :class="{'select':selectStruct===it}" @click="onClickStruct(it)">{{it.name + (it.textCache != it.editCache ? ' *':'')}}</div> -->

		</div>
		<!-- <div class="tree-content" v-show="isShowStructView">
			<div class="item" v-for="(it,idx) in selectStructInfo.structs" :key="idx" :class="{'select':selectStruct===it}" @click="onClickStruct(it)">{{it.name + ((selectStruct===it&&editText!=originText) ? ' *':'')}}</div>
		</div> -->
	</div>

	<!-- map -->
	<div class="map-box">
		<MapPreview :data="arrSelectStructAddr" :onHightlightChanged="anoOnHightlightChanged"/>
	</div>
	
	<!-- hex view -->
	<div class="hex-box">
		<HexView ref="hexView" :onUpdateFile="anoOnUpdateFile" :onScroll="anoOnHexViewScroll"/>
		<div class="hex-fill-box">
			<HexViewFill ref="hexViewFill" :arrAddress="arrAddress" :arrHightlightData="arrHightlightData" :hexStartRow="hexStartRow"/>
		</div>
	</div>

	<!-- eidt -->
	<div class="config-box">
		<div class="title">
			<div class="lbl">{{viewFileTitle + ((editText!=originText) ? ' *':'')}}</div>
			<div class="btn-box">
				<div class="btn" title="help">?</div>
			</div>
		</div>
		<div class="content">
			<div class="text-edit" ref="textEdit"/>
		</div>
		<!-- <SimpleMonacoEditor class="text-edit" ref="smEditor"/> -->
	</div>

	<!-- status bar -->
	<div class="bottom-box">
		<span style="padding-left:5px;">{{log}}</span>
	</div>

</div>
</template>

<script lang="ts">
import ctl from "./HomeTs";
export default ctl;
</script>

<style>
/* @font-face {
	font-family: 'simsunspace';
	src: url('/static/font/simsunspace2.ttf') format('truetype');
} */
</style>

<style lang="scss">
@import "/src/assets/css/style.scss";

.home {
	position: absolute; width: 100%; height: 100%; top: 0; left: 0;
	>.top-box {
		height: 60px; width: 100%; border-bottom: 1px solid #acacac; @extend %ex-one-line; padding: 4px;
		>.item {
			cursor: pointer; position: relative; display: inline-block; width: 80px; height: 40px; text-align: center; font-size: 12px; border: 1px solid #acacac; white-space: pre-wrap; vertical-align: top; margin-right: 4px; overflow: hidden;
			>span { position: relative; display: inline-block; top: 50%; transform: translateY(-50%); line-height: 14px; }
			>.file-box{
				cursor: pointer; position: absolute; left: 0; top: 0; width: 100%; height: 100%;
				>input { cursor: pointer; width: 100%; height: 100%; opacity: 0; padding-left: 200px; }
			}
			&:hover { background: #ececec; }
		}
	}

	// >.center-box {
	// 	position: absolute; top: 64px; left: 0; width: 100%; bottom: 327px+1px; background: #f0f;
	// }
	>.tree-box {
		position: absolute; background: #fff; top: 60px; left: 0; width: 200px; bottom: 25px; border-right: 1px solid #acacac;
		>.head {
			position: relative; width: 100%; height: 30px; border-bottom: 1px solid #e2e2e2;
			// >.row1 {
			// 	position: relative; height: 28px; border-bottom: 1px solid #acacac;
			// 	>.select-box {
			// 		position: absolute; height: 100%; left: 0; right: 28px;
			// 		>select { width: 100%; height: 100%; border: 0; background: transparent; }
			// 	}
			// 	>.right-box {
			// 		position: absolute; display: inline-block; top: 0; right: 0;
			// 		>.btn { cursor: pointer; width: 20px; height: 20px; margin-top: 4px; margin-right: 4px; }
			// 	}
			// }
			// position: relative; height: 30px;
			>.title { display: inline-block; height: 30px; line-height: 30px; vertical-align: top; font-size: 12px; margin-left: 2px; }
			>.left-box,>.right-box {
				display: inline-block;
				>.ico,>.btn,>.lbl-btn { width: 18px; height: 18px; line-height: 18px; margin-top: 6px; margin-right: 4px; }
				>.btn { cursor: pointer; }
				>.lbl-btn {
					cursor: pointer; display: inline-block; border: 1px solid #000; font-size: 14px; text-align: center;
					// &:hover { background: #eeeeee; }
				}
				>.select { background: #e4e4e4; }
			}
			>.left-box { margin-left: 4px; }
			>.right-box {
				position: absolute; top: 0; right: 0;
			}
		}
		>.content {
			position: absolute; left: 0; top: 30px; width: 100%; bottom: 0; overflow: hidden; overflow-y: auto; @include scrollbar(6px);
			>.item {
				cursor: pointer; position: relative; height: 36px; line-height: 36px; font-size: 14px;
				>.lbl {
					width: 100%; height: 100%; padding-left: 5px;
					&:hover { background: #cfcfcf; }
				}
				>.ctl-box {
					position: absolute; right: 4px; top: 0; height: 100%;
					>.ok-box { position: relative; display: inline-block; font-size: 12px; height: 100%; background: #cfcfcf; margin-right: 4px; padding: 0 4px; border-radius: 2px; vertical-align: top; }
					>.btn {
						position: relative; display: inline-block; width: 16px; height: 16px;
						&:hover { transform: scale(1.2) }
					}
				}
			}
			.select { background: #e4e4e4; }
		}
		// >.content {
		// 	>.item {
				
				
		// 		>.ctl-box>.btn { margin-top: 10px; }
		// 		&:hover { background: #e4e4e4; }
		// 	}
		// }
		// >.tree-content {
			
		// }
	}
	>.tree-parser {
		>.content>.item {
			>.input-box {
				position: absolute; left: 0; top: 0; right: 0; height: 100%; background: #fff; padding-left: 5px;
				>input { width: 100%; height: 100%; background: transparent; border: 0; vertical-align: top; border-bottom: 1px solid #cfcfcf; }
			}
		}
	}
	>.tree-struct {
		>.content {
			// >.root { height: 24px; line-height: 24px; padding-left: 5px; background: #f5f5f5; }
			>.top-ctl-box {
				height: 30px; line-height: 30px; border-bottom: 1px solid #acacac; @extend %ex-one-line;
				>.btn {
					cursor: default; display: inline-block; height: 100%; padding: 0 6px; font-size: 12px; vertical-align: top;
					&:hover { background: #e4e4e4; }
				}
			}
			>.item {
				height: 24px; line-height: 24px; font-size: 12px;
				>.lbl {
					&:before { content: ''; display: inline-block; width: 6px; height: 6px; margin-right: 6px; background: #979797; border-radius: 3px; vertical-align: top; margin-top: 8px; }
				}
				>.ctl-box>.btn { margin-top: 3px; }
			}
		}
	}

	>.map-box {
		position: absolute; background: #fff; top: 60px; left: 200px; width: 658px; bottom: 345px; overflow: auto; @include scrollbar(4px);
	}

	>.hex-box {
		position: absolute; background: #fff; left: 200px; bottom: 25px; width: 658px; height: 320px; border-top: 1px solid #acacac;
		>.hex-fill-box { pointer-events: none; position: absolute; left: 85px; top: 24px; width: 406px; height: 288px; }
	}
	
	>.config-box {
		position: absolute; background: #fff; top: 60px; right: 0; left: 200px+658px; bottom: 25px; border-left: 1px solid #acacac;
		>.title {
			position: relative; height: 28px; width: 100%; background: #252526;
			>.lbl { display: inline-block; height: 28px; line-height: 26px; padding-left: 8px; font-size: 12px; color: #fff; }
			>.btn-box {
				position: absolute; right: 0; top: 0; height: 20px;
				>.btn { cursor: pointer; display: inline-block; border: 1px solid #bbb; width: 18px; height: 18px; margin-top: 5px; margin-right: 5px; line-height: 16px; font-size: 12px; color: #bbb; text-align: center; vertical-align: top; }
				>.btn:hover { border: 1px solid #fff; }
				>.select { border: 1px solid #fff; color: #fff; }
			}
		}
		>.content {
			position: absolute; left: 0; top: 28px; bottom: 0; width: 100%;
			.text-edit { width: 100%; height: 100%; overflow: hidden; }
		}
	}

	>.bottom-box {
		position: absolute; background: #fff; left: 0; bottom: 0; width: 100%; height: 25px; border-top: 1px solid #acacac;
	}
}
</style>
