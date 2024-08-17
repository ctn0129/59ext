/* eslint-disable no-console */
import { createApp } from 'vue'
import App from './App.vue'
import { setupApp } from '~/logic/common-setup'
import { hiddenHouses, isFilterHidden, savedHouses } from '~/logic'
import { hideContent, hideItemHeart, hideRightSideFloatingMenu } from './hide'
import { watchImmediate } from '@vueuse/core'
import { createHideBtn, createSaveBtn } from './buttons'

function main() {
	console.info('Hello World from 59ext')

	const parsedUrl = new URL(window.location.href)
	const isDetailPage = /^\d+$/.test(parsedUrl.pathname.slice(1))

	if (isDetailPage) {
		// =========================== 細節頁面的邏輯 ===========================
		console.info('Hello House Detail Page')

		// =========================== feat: esc to close ===========================
		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				// Select the button using its class name
				const closeButton = document.querySelector<HTMLElement>('.close-btn')
				if (closeButton) {
					closeButton.click() // Simulate a click on the button
				}
			}
		})

		return
	}

	// =========================== 列表頁面的邏輯 ===========================

	// =========================== 隱藏元素 ===========================

	watchImmediate(isFilterHidden, () => {
		hideContent(isFilterHidden)
	})

	// 隱藏右側懸浮選單
	hideRightSideFloatingMenu()

	// =========================== inject css ===========================
	injectCSS()

	// =========================== feat: 隱藏與儲存物件 ===========================

	const numHiddenInThisPage = ref(0)

	// 抓取租屋清單的項目
	const itemSelector = '.list-wrapper > main .item'

	const items = document.querySelectorAll<HTMLElement>(itemSelector)
	if (!items.length) {
		throw new Error(`Cannot find ${itemSelector}`)
	}

	function getInfoByItem(item: HTMLElement): { id: string; title: string } {
		const linkElement = item.querySelector<HTMLElement>('.item-info-title a')
		if (!linkElement) throw new Error('Cannot find .item-info-title a')
		const id = linkElement.getAttribute('href')?.split('/').pop()
		if (!id) throw new Error('Cannot get id')

		const title = linkElement.innerText
		if (!title) throw new Error('Cannot get title')

		return { id, title }
	}

	for (let i = 0; i < items.length; i++) {
		// 隱藏原本的愛心儲存
		hideItemHeart(items[i])

		const { id, title } = getInfoByItem(items[i])

		// 新增隱藏按鈕、儲存按鈕
		const hideBtn = createHideBtn(id, title)
		const saveBtn = createSaveBtn(id, title)
		const itemInfo = items[i].querySelector<HTMLElement>('.item-info')
		if (!itemInfo) throw new Error('Cannot find .item-info')

		itemInfo.appendChild(hideBtn)
		itemInfo.appendChild(saveBtn)
	}

	// const isHidden = ref(false)

	// watch(isHidden, () => {
	// 	if (isHidden.value) {
	// 		displayHiddenAmount()
	// 	}
	// })

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
		// 第一次需要延遲 1 秒，否則會找不到 element
		if (counter === 0) {
			renderSection(1000)
			counter++
		} else {
			renderSection()
		}
	})

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

	// =================================== Mount App.vue ================================
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

function injectCSS() {
	const style = document.createElement('style')
	style.textContent = `
			button.ext-hide-button {
				position: absolute;
				right: 10px;
				top: 0px;
				width: 100px;
				padding: 10px;
				cursor:pointer;
			}

			button.ext-hide-button:hover {
				background-color: #d0cccc;
			}

			button.ext-save-button {
				position: absolute;
				right: 10px;
				top: 40px;
				width: 100px;
				padding: 10px;
				cursor:pointer;
			}

			button.ext-save-button:hover {
				background-color: #d0cccc;
			}
		`
	document.head.appendChild(style)
}
