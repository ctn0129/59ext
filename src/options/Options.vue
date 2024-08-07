<script setup lang="ts">
import logo from '~/assets/logo.svg'
import { storageDemo } from '~/logic/storage'
import { hiddenHouses } from '~/logic/storage'

function removeHiddenHouse(id: string) {
	hiddenHouses.value = hiddenHouses.value.filter(house => house.id !== id)
}
</script>

<template>
	<main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200 text-base">
		<!-- <SharedSubtitle /> -->

		<div class="text-xl">hiddenHouses</div>
		<div v-for="house in hiddenHouses" :key="house.id" class="mt-2">
			<div class="flex justify-center items-center gap-2">
				<a :href="`https://rent.591.com.tw/${house.id}`" target="_blank">{{ house.id }} - {{ house.title }}</a>
				<button class="icon-btn" @click="removeHiddenHouse(house.id)">Show it</button>
			</div>
		</div>
	</main>
</template>
