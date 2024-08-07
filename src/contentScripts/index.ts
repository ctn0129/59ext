/* eslint-disable no-console */
import { onMessage } from 'webext-bridge/content-script'
import { createApp } from 'vue'
import App from './views/App.vue'
import { setupApp } from '~/logic/common-setup'
import { send } from 'vite'
import { links } from '~/core'

import { hiddenHouses } from '~/logic'

const hostname = 'rent.591.com.tw'

function main() {
	if (window.location.hostname !== hostname) return

	console.info('Hello world from webext')

	// inject style
	const style = document.createElement('style')
	style.textContent = `
			button.jc-hide-button {
				position: absolute;
				right: 10px;
				top: 60px;
				width: 100px;
			}
		`
	document.head.appendChild(style)

	// 換頁，下面都要重新跑一次

	// Hide button
	setTimeout(() => {
		const sections = document.querySelectorAll('section.vue-list-rent-item')
		if (!sections.length) {
			throw new Error('Cannot find .vue-list-rent-item')
		}

		// add mutation observer
		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				if (mutation.type === 'attributes') {
					console.log('page changed')
					appendHideButton()
					hideSections()
				}
			}
		})

		const switch_list_content = document.querySelector('.vue-list-rent-item')
		if (switch_list_content) {
			observer.observe(switch_list_content, { attributes: true, attributeFilter: ['data-bind'] })
		}

		appendHideButton()

		function appendHideButton() {
			sections.forEach(section => {
				const id = section.getAttribute('data-bind')
				let title = 'no title'
				const itemTitleElement = document.querySelector(`section.vue-list-rent-item[data-bind="${id}"] .item-title`)
				if (itemTitleElement) {
					const spanElement = itemTitleElement.querySelector('span')
					if (spanElement && spanElement.textContent) {
						title = spanElement.textContent
					}
				}
				if (!id) return

				const hideBtn = document.createElement('button')
				hideBtn.innerText = 'Hide/Show'
				hideBtn.className = 'jc-hide-button'
				hideBtn.addEventListener('click', () => {
					if (hiddenHouses.value.find(house => house.id === id)) {
						hiddenHouses.value = hiddenHouses.value.filter(house => house.id !== id)
						return
					}

					hiddenHouses.value.push({
						id,
						title,
					})
				})

				section.appendChild(hideBtn)
			})
		}
	}, 1000)

	function hideSections(delay: number = 0) {
		setTimeout(() => {
			const sections = document.querySelectorAll<HTMLElement>('section.vue-list-rent-item')
			if (!sections.length) throw new Error('Cannot find .vue-list-rent-item')

			sections.forEach(section => {
				const id = section.getAttribute('data-bind')
				if (!id) throw new Error('Cannot find id')

				if (hiddenHouses.value.find(house => house.id === id)) {
					section.style.background = 'gray'
				} else {
					section.style.background = 'white'
				}
			})
		}, delay)
	}

	let counter = 0

	watch(hiddenHouses, () => {
		// 第一次需要延遲 1 秒，否則會找不到 element
		if (counter === 0) {
			hideSections(1000)
			counter++
		} else {
			hideSections()
		}
	})

	// 如何偵測 url 變化？目的是在切換頁面時，必須重新綁定 hide button，因為整個 DOM section 和 id 都改變了

	// hiding content
	const hidingClasses = [
		'.nav-wrapper.house-page', // 最上面的 nav
		'.vue-list-new-head', // 第二排的標題
		'.container-right', // 右邊的廣告
		'.side_tool_wrap.newFiexdSide', // 最右邊的漂浮工具列
		'.vue-filter-container', // 篩選器
		'.vue-list-recommendation', // 推薦區塊
	]

	for (const className of hidingClasses) {
		const element = document.querySelector<HTMLElement>(className)
		if (element) {
			element.style.display = 'none'
		}
	}
}

try {
	main()
} catch (e: any) {
	alert(e)
}

// ;(() => {
// 	// Check if the current site is chatgpt.com
// 	if (window.location.hostname === 'chatgpt.com' || window.location.hostname.endsWith('.chatgpt.com')) {
// 		console.info('[vitesse-webext] Hello world from content script')

// 		// communication example: send previous tab title from background page
// 		onMessage('tab-prev', ({ data }) => {
// 			console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
// 		})

// 		// mount component to context window
// 		const container = document.createElement('div')
// 		container.id = __NAME__
// 		const root = document.createElement('div')
// 		const styleEl = document.createElement('link')
// 		const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
// 		styleEl.setAttribute('rel', 'stylesheet')
// 		styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
// 		shadowDOM.appendChild(styleEl)
// 		shadowDOM.appendChild(root)
// 		document.body.appendChild(container)
// 		const app = createApp(App)
// 		setupApp(app)
// 		app.mount(root)
// 	} else {
// 		console.info('[vitesse-webext] Content script not running on this site')
// 	}
// })()
