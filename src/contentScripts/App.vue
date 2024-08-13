<script setup lang="ts">
import 'uno.css'
import { isFilterHidden } from '~/logic'

const params = new URLSearchParams(window.location.search)
const paramsObj = Object.fromEntries(params.entries())

const kind = computed(() => {
	return paramsObj['kind']
})

const displayKind = computed(() => {
	if (kind.value === '1') {
		return '整層住家'
	} else if (kind.value === '2') {
		return '獨立套房'
	} else {
		return `kind: ${kind.value}`
	}
})
</script>

<template>
	<div class="ext-floating">
		<div class="ext-floating-content">
			<div class="text-3xl">{{ displayKind }}</div>
			<div class="mt-5">
				<div v-for="(value, key) in paramsObj" :key="key">{{ key }}: {{ value }}</div>
			</div>

			<div class="mt-5">
				<label class="inline-flex items-center cursor-pointer">
					<input type="checkbox" v-model="isFilterHidden" class="sr-only peer" />
					<div
						class="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:outline-none peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
					></div>
					<span class="ms-3">Filter</span>
				</label>
			</div>
		</div>
	</div>
</template>

<style scoped>
.ext-floating {
	@apply fixed right-2 bottom-2 m-5 z-100 flex;
}

.ext-floating-content {
	@apply p-10 rounded-lg;
	border: solid 1px black;
}
</style>
