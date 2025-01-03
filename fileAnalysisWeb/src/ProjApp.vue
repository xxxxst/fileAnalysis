<template>
<!-- <a-locale-provider :locale="locale"> -->
<div id="app" class="app">
	<router-view/>
</div>
<!-- </a-locale-provider> -->
</template>

<script lang="ts">
import ctl from "./ProjAppTs";
export default ctl;
</script>

<style lang="scss">
@import "assets/css/comStyle.scss";
html { height: 100%; -webkit-tap-highlight-color: transparent; }
body { height: 100%; overflow: hidden; font-size: 16px; background-color: #fff; }
* { margin: 0; padding: 0; box-sizing: border-box; outline: none; background-size: 100% 100%; background-repeat: no-repeat; @include scrollbar(4px); }
table { border-collapse: collapse; table-layout:fixed; }
textarea { display: inline-block; resize:none; outline: none; }
ul { list-style: none; vertical-align: top; }
li { vertical-align: top; }
a { text-decoration:none; color: #000; }
</style>

<style lang="scss">
@import "assets/css/globalStyle.scss";
@import "assets/css/ico.scss";
body { width: 100%; height: 100%; overflow: hidden; }
.app { position: absolute; width: 100%; height: 100%; top: 0; left: 0; overflow: hidden; }
</style>
