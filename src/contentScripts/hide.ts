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
