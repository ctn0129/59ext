<script setup lang="ts">
import { hiddenHouses, savedHouses, houseNotes } from '~/logic/storage'

function removeHiddenHouse(id: string) {
	hiddenHouses.value = hiddenHouses.value.filter(house => house.id !== id)
}

function unsaveHouse(id: string) {
	if (houseNotes.value?.[id]) {
		delete houseNotes.value[id]
	}
	savedHouses.value = savedHouses.value.filter(house => house.id !== id)
}

const reversedSavedHouses = computed(() => [...savedHouses.value].reverse())
const reversedHiddenHouses = computed(() => [...hiddenHouses.value].reverse())

const newNote = ref('')

const showAddBtn = ref<string>('')

const newNoteInput = ref<HTMLElement[] | null>(null)

function onClickAdd(id: string) {
	if (showAddBtn.value !== id) {
		showAddBtn.value = id

		nextTick(() => {
			newNoteInput.value?.[0].focus()
		})
	} else {
		showAddBtn.value = ''
	}
}

function addNote(id: string) {
	if (!newNote.value) return

	if (!houseNotes.value[id]) {
		houseNotes.value[id] = []
	}
	houseNotes.value[id].push(newNote.value)
	newNote.value = ''
	showAddBtn.value = ''
}

function onClickDeleteNote(id: string, index: number) {
	houseNotes.value[id].splice(index, 1)
}
</script>

<template>
	<main class="px-5 py-10 flex flex-col items-center text-gray-700 dark:text-gray-200 text-base">
		<!-- <SharedSubtitle /> -->

		<div class="">
			<div class="text-xl text-center">
				Saved Houses <span>({{ savedHouses.length }})</span>
			</div>
			<div class="w-full flex flex-col">
				<div v-for="house in reversedSavedHouses" :key="house.id" class="mt-2">
					<div class="flex gap-2">
						<button class="ext-btn" @click="unsaveHouse(house.id)">Unsave</button>
						<div class="flex gap-2 items-center">
							<a class="ext-link" :href="`https://rent.591.com.tw/${house.id}`" target="_blank">{{ house.title }}</a>
							<div v-for="(note, index) in houseNotes[house.id]" :key="note" class="flex border rounded">
								<div class="px-2 text-[#e66919]">{{ note }}</div>
								<button
									class="border rounded border-r-0 border-y-0 px-2 py-1 text-xs hover:bg-gray-100"
									@click="onClickDeleteNote(house.id, index)"
								>
									X
								</button>
							</div>
							<button v-if="showAddBtn !== house.id" class="ext-btn" @click="onClickAdd(house.id)">Add</button>
							<input
								ref="newNoteInput"
								v-if="showAddBtn === house.id"
								v-model="newNote"
								class="w-[100px] h-[20px] shadow appearance-none border rounded py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
								type="text"
								@keyup.enter="addNote(house.id)"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="text-xl mt-[300px]">
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
