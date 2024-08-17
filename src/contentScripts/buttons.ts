import { hiddenHouses, savedHouses } from '~/logic'

export function createHideBtn(id: string, title: string) {
	const hideBtn = document.createElement('button')
	hideBtn.innerText = 'Hide'
	hideBtn.className = 'ext-btn hide'
	hideBtn.addEventListener('click', event => {
		event.stopPropagation()

		// show if already hidden
		if (hiddenHouses.value.find(house => house.id === id)) {
			hiddenHouses.value = hiddenHouses.value.filter(house => house.id !== id)
			return
		}

		hiddenHouses.value.push({
			id,
			title,
		})
	})

	return hideBtn
}

export function createSaveBtn(id: string, title: string) {
	const saveBtn = document.createElement('button')
	saveBtn.innerText = 'Save/Unsave'
	saveBtn.className = 'ext-btn save'
	saveBtn.addEventListener('click', event => {
		event.stopPropagation()

		// unsave if already saved
		if (savedHouses.value.find(house => house.id === id)) {
			savedHouses.value = savedHouses.value.filter(house => house.id !== id)
			return
		}

		savedHouses.value.push({
			id,
			title,
		})
	})

	return saveBtn
}
