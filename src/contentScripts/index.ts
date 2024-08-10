/* eslint-disable no-console */
import { onMessage } from 'webext-bridge/content-script'
import { createApp } from 'vue'
import App from './App.vue'
import { setupApp } from '~/logic/common-setup'
import { send } from 'vite'
import { hiddenHouses, isFilterHidden, savedHouses } from '~/logic'

function main() {
	console.info('Hello World from 59ext')

	// @todo 區分是列表頁還是詳細頁
	// @todo observer 可否同時監控 section mounted 和 page changed 的時機？

	// inject css
	const style = document.createElement('style')
	style.textContent = `
			button.ext-hide-button {
				position: absolute;
				right: 10px;
				top: 30px;
				width: 100px;
			}

			button.ext-save-button {
				position: absolute;
				right: 10px;
				top: 60px;
				width: 100px;
			}
		`
	document.head.appendChild(style)

	const numHiddenInThisPage = ref(0)

	// 確保 section dom 已經 mounted
	setTimeout(() => {
		// copy pagination to the top
		// copied 的元素，換頁功能無法實現
		// const pagination = document.querySelector('.vue-public-list-page')

		// if (pagination) {
		// 	const cloned_pagination = pagination.cloneNode(true) as HTMLElement
		// 	const target_container = document.querySelector('.container-content-left')

		// 	if (target_container) {
		// 		const children = target_container.children

		// 		if (children.length >= 2) {
		// 			target_container.insertBefore(cloned_pagination, children[2])
		// 		} else {
		// 			target_container.insertBefore(cloned_pagination, target_container)
		// 		}
		// 	}
		// }

		// 抓取本頁的 section
		const sections = document.querySelectorAll('section.vue-list-rent-item')
		if (!sections.length) {
			throw new Error('Cannot find .vue-list-rent-item')
		}

		// add mutation observer
		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				if (mutation.type === 'attributes') {
					// 換頁時機
					console.log('Page changed')
					isHidden.value = false
					numHiddenInThisPage.value = 0

					appendButtons()
					renderSection()
				}
			}
		})

		const switch_list_content = document.querySelector('.vue-list-rent-item')
		if (switch_list_content) {
			observer.observe(switch_list_content, { attributes: true, attributeFilter: ['data-bind'] })
		}

		appendButtons()

		function appendButtons() {
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

				// create Hide/Show button
				const hideBtn = document.createElement('button')
				hideBtn.innerText = 'Hide'
				hideBtn.className = 'ext-hide-button'
				hideBtn.addEventListener('click', () => onClickHideButton(id))

				function onClickHideButton(id: string) {
					// show if already hidden
					if (hiddenHouses.value.find(house => house.id === id)) {
						hiddenHouses.value = hiddenHouses.value.filter(house => house.id !== id)
						return
					}

					hiddenHouses.value.push({
						id,
						title,
					})
				}

				// create Save button
				const saveBtn = document.createElement('button')
				saveBtn.innerText = 'Save/Unsave'
				saveBtn.className = 'ext-save-button'
				saveBtn.addEventListener('click', () => onClickSaveButton(id))

				function onClickSaveButton(id: string) {
					// unsave if already saved
					if (savedHouses.value.find(house => house.id === id)) {
						savedHouses.value = savedHouses.value.filter(house => house.id !== id)
						return
					}

					savedHouses.value.push({
						id,
						title,
					})
				}

				// append buttons
				section.appendChild(hideBtn)
				section.appendChild(saveBtn)

				// 把 .item-collect 拿掉
				const item_collect = document.querySelector(`section.vue-list-rent-item .item-collect`)
				if (item_collect) {
					item_collect.remove()
				}
			})
		}
	}, 1000)

	const isHidden = ref(false)

	watch(isHidden, () => {
		if (isHidden.value) {
			displayHiddenAmount()
		}
	})

	function renderSection(delay: number = 0) {
		setTimeout(() => {
			const sections = document.querySelectorAll<HTMLElement>('section.vue-list-rent-item')
			if (!sections.length) throw new Error('Cannot find .vue-list-rent-item')

			sections.forEach(section => {
				const id = section.getAttribute('data-bind')
				if (!id) throw new Error('Cannot find id')

				if (hiddenHouses.value.find(house => house.id === id)) {
					numHiddenInThisPage.value++
					// section.style.background = 'gray'
					section.style.display = 'none'
				} else {
					// section.style.background = 'white'
					section.style.display = 'block'
				}

				// render saved houses
				if (savedHouses.value.find(house => house.id === id)) {
					section.style.background = '#f6f6ce'
				} else {
					section.style.background = ''
				}
			})

			isHidden.value = true
		}, delay)
	}

	let counter = 0

	// note: 本身自帶 immediate
	// 首次載入時跑了兩次，一次 for hiddenHouses，一次 for savedHouses
	watch([hiddenHouses, savedHouses], () => {
		console.log('watch')
		// 第一次需要延遲 1 秒，否則會找不到 element
		if (counter === 0) {
			renderSection(1000)
			counter++
		} else {
			renderSection()
		}
	})

	// Hide content

	watch(
		isFilterHidden,
		() => {
			const hiddenClasses: { [key: string]: boolean } = {
				'.nav-wrapper.house-page': false, // 最上面的 nav
				'.vue-list-new-head': false, // 第二排的標題
				'.container-right': false, // 右邊的廣告
				'.side_tool_wrap.newFiexdSide': false, // 最右邊的漂浮工具列
				'.vue-filter-container': isFilterHidden.value, // 篩選器
				'.vue-list-recommendation': false, // 推薦區塊
			}

			for (const className in hiddenClasses) {
				console.log(className)
				const element = document.querySelector<HTMLElement>(className)
				if (element) {
					if (!hiddenClasses[className]) {
						element.style.display = 'none'
					} else {
						element.style.display = 'block'
					}
				}
			}
		},
		{
			immediate: true,
		},
	)

	// 顯示本頁為隱藏的數量
	function displayHiddenAmount() {
		setTimeout(() => {
			// 計算本頁有幾個 section
			const sections = document.querySelectorAll<HTMLElement>('section.vue-list-rent-item')
			if (!sections.length) throw new Error('Cannot find .vue-list-rent-item')

			// 顯示本頁為隱藏的數量
			const switch_amount = document.querySelector<HTMLElement>('div.list-container-content .switch-tips .switch-amount')
			if (!switch_amount) throw new Error('Cannot find .switch-amount')

			// remove text by id
			document.getElementById('displayHiddenAmount')?.remove()

			// 顯示本頁待看的數量
			const text = document.createElement('div')
			// add id to text
			text.style.display = 'inline'
			text.id = 'displayHiddenAmount'
			text.innerHTML = ` (已隱藏 ${numHiddenInThisPage.value} 個，本頁尚有 ${sections.length - numHiddenInThisPage.value} 個)`
			switch_amount.appendChild(text)
		}, 1000)
	}

	// press esc to click .close-btn
	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			// Select the button using its class name
			const closeButton = document.querySelector<HTMLElement>('.close-btn')
			if (closeButton) {
				closeButton.click() // Simulate a click on the button
			}
		}
	})

	// mount App.vue to context window
	const container = document.createElement('div')
	container.id = __NAME__
	const root = document.createElement('div')
	const styleEl = document.createElement('link')
	const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
	styleEl.setAttribute('rel', 'stylesheet')
	styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
	shadowDOM.appendChild(styleEl)
	shadowDOM.appendChild(root)
	document.body.appendChild(container)
	const app = createApp(App)
	setupApp(app)
	app.mount(root)

	// communication example: send previous tab title from background page
	// 		onMessage('tab-prev', ({ data }) => {
	// 			console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
	// 		})
}

try {
	main()
} catch (e: any) {
	console.error(e)
	alert(e)
}
