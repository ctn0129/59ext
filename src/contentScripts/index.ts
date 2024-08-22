/* eslint-disable no-console */
import { createApp } from 'vue'
import App from './App.vue'
import { setupApp } from '~/logic/common-setup'
import { hiddenHouses, isFilterHidden, savedHouses } from '~/logic'
import { hideContent, hideRightSideFloatingMenu } from './hide'
import { watchImmediate } from '@vueuse/core'
import { createHideBtn, createSaveBtn } from './buttons'

function main() {
	console.info('Hello World from 59ext')

	const parsedUrl = new URL(window.location.href)
	const isDetailPage = /^\d+$/.test(parsedUrl.pathname.slice(1))

	injectCSS()
	hideRightSideFloatingMenu()

	// =========================== House Detail Page ===========================

	if (isDetailPage) {
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

		// =========================== 顯示隱藏、儲存狀態，新增隱藏和儲存按鈕 ===========================
		const house_price = document.querySelector<HTMLElement>('.house-price')
		if (!house_price) {
			console.error('Cannot find .house-price')
			return
		}

		const is_hidden = document.createElement('span')
		const is_saved = document.createElement('span')

		const url = window.location.href
		const parts = url.split('/')
		const id = parts[parts.length - 1]
		const title = document.querySelector<HTMLElement>('.house-title > h1')?.innerText || 'No Title'

		is_hidden.id = 'is-hidden'
		is_saved.id = 'is-saved'

		// =========================== detail page add Hide button ===========================

		const hideBtn = document.createElement('button')
		hideBtn.innerText = 'Hide/Show'
		hideBtn.className = 'ext-btn hide'
		hideBtn.style.display = 'inline-block'
		hideBtn.style.position = 'static'
		hideBtn.addEventListener('click', event => {
			event.stopPropagation()

			// show if already hidden
			if (hiddenHouses.value.find(house => house.id === id)) {
				hiddenHouses.value = hiddenHouses.value.filter(house => house.id !== id)
				window.location.reload()
				return
			}

			hiddenHouses.value.push({
				id,
				title,
			})

			window.location.reload()
		})

		// =========================== detail page add Save button ===========================

		const saveBtn = document.createElement('button')
		saveBtn.innerText = 'Save/Unsave'
		saveBtn.className = 'ext-btn save'
		saveBtn.style.display = 'inline-block'
		saveBtn.style.position = 'static'
		saveBtn.style.marginLeft = '5px'
		saveBtn.addEventListener('click', event => {
			event.stopPropagation()

			// unsave if already saved
			if (savedHouses.value.find(house => house.id === id)) {
				savedHouses.value = savedHouses.value.filter(house => house.id !== id)
				window.location.reload()
				return
			}

			savedHouses.value.push({
				id,
				title,
			})

			window.location.reload()
		})

		setTimeout(() => {
			house_price.appendChild(is_hidden)
			house_price.appendChild(is_saved)

			is_hidden.innerHTML = !!hiddenHouses.value.find(house => house.id === id) ? '已隱藏' : ''
			is_saved.innerHTML = !!savedHouses.value.find(house => house.id === id) ? '已儲存' : ''

			house_price.appendChild(hideBtn)
			house_price.appendChild(saveBtn)
		}, 500)

		return
	}

	// =========================== 隱藏元素 ===========================

	watchImmediate(isFilterHidden, () => {
		hideContent(isFilterHidden)
	})

	// =================================== 渲染列表 ================================

	const hiddenNum = ref(0)

	const main = document.querySelector<HTMLElement>('main')
	if (!main) throw new Error('Cannot find main')

	const callback: MutationCallback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				if (mutation.target.nodeName === 'DIV') {
					const link = main.querySelector('.link.v-middle')
					if (link && mutation.removedNodes?.[0]?.nodeName === 'SPAN') {
						setTimeout(() => {
							console.log('observer render')
							render()
						}, 500)

						break
					}
				}
			}
		}
	}

	const observer = new MutationObserver(callback)
	observer.observe(main, { childList: true, subtree: true })

	watch([hiddenHouses, savedHouses], () => {
		console.log('watch hiddenHouses and savedHouses')
		render()
	})

	function render() {
		console.log('render')
		hiddenNum.value = 0

		// 抓取租屋清單的項目
		const itemSelector = '.list-wrapper > main .item'

		const items = document.querySelectorAll<HTMLElement>(itemSelector)
		if (!items.length) {
			throw new Error(`Cannot find ${itemSelector}`)
		}

		for (let i = 0; i < items.length; i++) {
			const { id, title } = getInfoByItem(items[i])

			// hide hidden houses
			if (hiddenHouses.value.find(house => house.id === id)) {
				hiddenNum.value++
				items[i].parentElement!.style.display = 'none'

				continue
			} else {
				items[i].parentElement!.style.display = 'block'
			}

			// highlight saved houses
			if (savedHouses.value.find(house => house.id === id)) {
				items[i].style.background = '#f6f6ce'
			} else {
				items[i].style.background = ''
			}

			// 新增隱藏按鈕、儲存按鈕
			const hideBtn = createHideBtn(id, title)
			const saveBtn = createSaveBtn(id, title)
			const itemInfo = items[i].querySelector<HTMLElement>('.item-info')
			if (!itemInfo) throw new Error('Cannot find .item-info')

			itemInfo.appendChild(hideBtn)
			itemInfo.appendChild(saveBtn)

			// 移除原本的愛心儲存功能
			items[i].querySelector<HTMLElement>('.item-info-fav')?.remove()
		}

		// 顯示本頁已隱藏的數量
		const total = document.querySelector<HTMLElement>('.list-sort .total')

		const hiddenAmount = document.createElement('span')

		hiddenAmount.id = 'hidden-amount'
		hiddenAmount.innerHTML = ` (已隱藏 ${hiddenNum.value} 個，本頁尚有 ${items.length - hiddenNum.value} 個)`

		document.getElementById('hidden-amount')?.remove()
		total?.appendChild(hiddenAmount)
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
	#is-hidden, #is-saved {
		margin: 0 5px;
		color: red;
	}

	.ext-btn {
		border: 1px solid transparent;
		border-radius: 0.25rem;
		padding: 8px 8px;
		font-size: 0.75rem;
		background-color: #0d9488;
		color: #ffffff;
		cursor: pointer;
		z-index: 9999;
	}

	.ext-btn:hover {
		background-color: #0f766e;
	}

	.ext-btn:disabled {
		cursor: default;
		background-color: #4b5563;
		opacity: 0.5;
	}

	.ext-btn.hide {
		position: absolute;
		right: 10px;
		top: 0px;
		width: 100px;
	}

	.ext-btn.save {
		position: absolute;
		right: 10px;
		top: 40px;
		width: 100px;
	}
	`
	document.head.appendChild(style)
}
