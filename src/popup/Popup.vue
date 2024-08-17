<script setup lang="ts">
import { links } from '~/links'
import { runtime } from 'webextension-polyfill'

function openOptionsPage() {
	runtime.openOptionsPage()
}
</script>

<template>
	<main class="w-[300px] px-4 py-5 text-center text-gray-700">
		<!-- <Logo />
		<div>Popup</div>
		<SharedSubtitle /> -->

		<button class="btn mt-2" @click="openOptionsPage">後台</button>

		<div v-for="link in links" :key="link.name">
			<a :href="link.url" target="_blank" class="btn mt-2">{{ link.name }}</a>
		</div>
	</main>
</template>
