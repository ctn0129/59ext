import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

type House = {
	id: string
	title: string
}
export const hiddenHouses = useWebExtensionStorage('hidden-houses', [] as House[])
export const savedHouses = useWebExtensionStorage('saved-houses', [] as House[])
export const isFilterHidden = useWebExtensionStorage('is-filter-hidden', false)
export const houseNotes = useWebExtensionStorage('house-notes', {} as Record<string, string[]>)
