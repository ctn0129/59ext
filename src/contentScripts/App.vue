<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import 'uno.css'

const params = new URLSearchParams(window.location.search)
const paramsObj = Object.fromEntries(params.entries())
</script>

<template>
	<div class="fixed right-10 top-[100px] m-5 z-100 flex">
		<div class="p-10 border border-black rounded-lg">
			<div class="text-2xl" v-for="(value, key) in paramsObj" :key="key">{{ key }}: {{ value }}</div>
		</div>
	</div>
</template>
