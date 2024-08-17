/**
 * 隱藏右側懸浮選單
 */
export function hideRightSideFloatingMenu() {
	const selector = 'aside.sidebar.print-ignore.fold'

	function hideAsideElement() {
		const asideElement = document.querySelector<HTMLElement>(selector)
		if (asideElement) {
			asideElement.style.display = 'none'
		}
	}

	// Create a MutationObserver to watch for changes in the DOM
	const observer = new MutationObserver((mutationsList, observer) => {
		for (const mutation of mutationsList) {
			if (mutation.type === 'childList') {
				// Check if the aside element is added
				const asideElement = document.querySelector(selector)
				if (asideElement) {
					// Hide the aside element
					hideAsideElement()
					// Once found and hidden, we can stop observing
					observer.disconnect()
				}
			}
		}
	})

	// Start observing the document's body for changes
	observer.observe(document.body, {
		childList: true,
		subtree: true,
	})

	// In case the element is already in the DOM, hide it immediately
	hideAsideElement()
}

export function hideContent(isFilterHidden: Ref<boolean>) {
	const hiddenClasses: { [key: string]: boolean } = {
		'.header-wrapper': false, // 最上面的 nav
		'.new-search-logo': false,
		'.new-search-input.form-inline': false, // 搜尋
		'.search-link': false, // 社區找房、地圖找房
		'.vue-list-new-head': isFilterHidden.value, // 選擇城市
		'.side_tool_wrap.newFiexdSide': false, // 最右邊的漂浮工具列
		'.filter-container': isFilterHidden.value, // 篩選器
		'.recommend-container': false, // 推薦區塊
	}

	for (const className in hiddenClasses) {
		const element = document.querySelector<HTMLElement>(className)
		if (element) {
			if (!hiddenClasses[className]) {
				element.style.display = 'none'
			} else {
				element.style.display = 'block'
			}
		}
	}

	// 隱藏右側欄位廣告
	const asideElement = document.querySelector<HTMLElement>('.list-wrapper aside')
	if (asideElement) {
		asideElement.style.display = 'none'
	}
}

/**
 * 隱藏房屋的儲存愛心按鈕
 */
export function hideItemHeart(item: HTMLElement) {
	const heart = item.querySelector<HTMLElement>('.item-info-fav')
	if (!heart) throw new Error('Cannot find .item-info-fav')

	heart.style.display = 'none'
}
