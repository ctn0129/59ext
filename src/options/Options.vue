<script setup lang="ts">
import { hiddenHouses, savedHouses } from '~/logic/storage'

function removeHiddenHouse(id: string) {
	hiddenHouses.value = hiddenHouses.value.filter(house => house.id !== id)
}

function unsaveHouse(id: string) {
	savedHouses.value = savedHouses.value.filter(house => house.id !== id)
}

const reversedSavedHouses = computed(() => [...savedHouses.value].reverse())
const reversedHiddenHouses = computed(() => [...hiddenHouses.value].reverse())
</script>

<template>
	<main class="px-4 py-10 flex flex-col items-center text-gray-700 dark:text-gray-200 text-base">
		<!-- <SharedSubtitle /> -->

		<div class="text-xl">
			Saved Houses <span>({{ savedHouses.length }})</span>
		</div>
		<div class="flex flex-col justify-center">
			<div v-for="house in reversedSavedHouses" :key="house.id" class="mt-2">
				<div class="flex gap-2">
					<button class="ext-btn" @click="unsaveHouse(house.id)">Unsave</button>
					<a class="ext-link" :href="`https://rent.591.com.tw/${house.id}`" target="_blank">{{ house.title }}</a>
				</div>
			</div>
		</div>

		<div class="text-xl mt-10">
			Hidden Houses <span>({{ hiddenHouses.length }})</span>
		</div>
		<div class="flex flex-col justify-center">
			<div v-for="house in reversedHiddenHouses" :key="house.id" class="mt-2">
				<div class="flex gap-2">
					<button class="ext-btn" @click="removeHiddenHouse(house.id)">Remove</button>
					<a class="ext-link" :href="`https://rent.591.com.tw/${house.id}`" target="_blank">{{ house.title }}</a>
				</div>
			</div>
		</div>
	</main>
</template>
