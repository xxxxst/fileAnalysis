<template>

<div class="content-fill">
	<textarea class="input" :class="{'input-ime':isIMEStart}" :style="textareaStyle" v-model="textInput" v-noSpell ref="textarea" v-show="!readOnly" @blur="onTextareaBlur()"/>
	<div class="cursor" :class="{'cursor-flash':isFocus&&!cursorHold&&!readOnly}" :style="cursorStyle"></div>
	<span class="char-test" ref="charTest">a</span>
</div>

</template>

<script lang="ts">
import ctl from "./ContentFillTs";
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

.simple-monaco-editor .content-fill {
	position: absolute; left: 0; top: 0; right: 0; height: 0;
	>.input { position: absolute; width: 1px; height: 1px; color: transparent; background: transparent; margin: 0; padding: 0; border: 0; letter-spacing:0; overflow: hidden; white-space:nowrap; word-break:break-all; }
	>.input-ime { color: #fff; }
	// >.input { position: absolute; width: 20px; height: 20px; color: #000; background: #fff; margin: 0; padding: 0; border: 0; overflow: hidden; white-space:nowrap; letter-spacing: 0; }
	>.cursor { position: absolute; display: inline-block; width: 2px; background: #aeafad; pointer-events: none; }
	>.cursor-flash { animation: aniCursorFlash 1s linear 0s infinite; }
	>.cursor-hold { opacity: 1; }
	>.char-test { color: transparent; pointer-events: none; }
}
</style>
