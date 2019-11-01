<template>

<div class="home" v-show="isInited">
	<div class="top-box">

	</div>
	
	<div class="tree-box" v-if="!selectStructInfo">
		<div class="head">
			<div class="left-box">
				<img class="ico" src="static/image/select.png" alt="">
			</div>
			<div class="title">选择格式</div>
			<div class="right-box">
				<img class="btn" src="static/image/add.png" alt="" @click="onClickAddFormat()">
			</div>
		</div>
		<div class="content">
			<div class="item" v-for="(it,idx) in lstFileStruct" :key="idx" @click="onClickFormat(it)">{{it.name}}</div>
		</div>
	</div>
	
	<div class="tree-box" v-if="selectStructInfo">
		<div class="head">
			<div class="left-box">
				<img class="btn" src="static/image/back.png" alt="" @click="onClickBack()">
			</div>
			<div class="title">{{selectStructInfo.name}}</div>
			<div class="right-box">
				<!-- <img class="btn" src="static/image/add.png" alt=""> -->
				<div class="lbl-btn" :class="{'select':isShowStructView}" title="view struct" @click="onClickShowHideStructView()">C</div>
			</div>
		</div>
		<div class="tree-content" v-show="!isShowStructView">
			<!-- <div class="item root">* root</div> -->
			<div class="item" v-for="(it,idx) in selectStructInfo.routes" :key="idx" :class="{'select':selectRootStruct===it}" @click="onClickRootStruct(it)">{{it.name + ((selectRootStruct===it&&editText!=originText) ? ' *':'')}}</div>
		</div>
		<div class="tree-content" v-show="isShowStructView">
			<div class="item" v-for="(it,idx) in selectStructInfo.structs" :key="idx" :class="{'select':selectStruct===it}" @click="onClickStruct(it)">{{it.name + ((selectStruct===it&&editText!=originText) ? ' *':'')}}</div>
		</div>
	</div>

	<div class="map-box">

	</div>
	
	<div class="hex-box">
		<HexView/>
	</div>

	<div class="config-box">
		<div class="text-edit" ref="textEdit"/>
		<SimpleMonacoEditor class="text-edit" ref="smEditor"/>
	</div>

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
		height: 60px; width: 100%; border-bottom: 1px solid #acacac;
	}

	// >.center-box {
	// 	position: absolute; top: 64px; left: 0; width: 100%; bottom: 327px+1px; background: #f0f;
	// }
	>.tree-box {
		position: absolute; background: #fff; top: 60px; left: 0; width: 200px; bottom: 25px; border-right: 1px solid #acacac;
		>.head {
			position: relative; width: 100%; height: 30px; border-bottom: 1px solid #acacac;
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
			>.title { display: inline-block; height: 30px; line-height: 30px; vertical-align: top; font-size: 14px; margin-left: 2px; }
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
		>.content,>.tree-content {
			position: absolute; left: 0; top: 30px; width: 100%; bottom: 0; overflow: hidden; overflow-y: auto; @include scrollbar(6px);
		}
		>.content {
			>.item {
				cursor: pointer; height: 36px; line-height: 36px; padding-left: 5px;
				&:hover { background: #e4e4e4; }
			}
		}
		>.tree-content {
			>.root { height: 28px; line-height: 28px; padding-left: 5px; background: #f5f5f5; }
			>.item {
				cursor: pointer; height: 28px; line-height: 28px; padding-left: 5px;
				&:hover { background: #cfcfcf; }
			}
				>.select { background: #e4e4e4; }
		}
	}

	>.map-box {
		position: absolute; background: #fff; top: 60px; left: 200px; width: 658px; bottom: 335px;
	}

	>.hex-box {
		position: absolute; background: #fff; left: 200px; bottom: 25px; width: 658px; height: 310px; border-top: 1px solid #acacac;
	}
	
	>.config-box {
		position: absolute; background: #fff; top: 60px; right: 0; left: 200px+658px; bottom: 25px; border-left: 1px solid #acacac;
		.text-edit { width: 100%; height: 49%; margin-bottom: 4px; overflow: hidden; }
	}

	>.bottom-box {
		position: absolute; background: #fff; left: 0; bottom: 0; width: 100%; height: 25px; border-top: 1px solid #acacac;
	}
}
</style>
