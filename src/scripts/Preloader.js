export default class Preloader
{
	/**
	 * Название предназначенного блока
	 *
	 * @type {string}
	 */
	block;

	/**
	 * Элемент прелоадера
	 *
	 * @type {HTMLDivElement}
	 */
	element;

	/**
	 * Создание экземпляра прелоадера
	 *
	 * @param {string} selectorBlock - Селектор предназначенного блока
	 * @param {string} blockName - Название предназначенного блока
	 */
	constructor(selectorBlock, blockName)
	{
		this.block = blockName;

		// Создание прелоадера
		this.element = document.createElement('div');
		this.element.classList.add('preloader');
		this.element.dataset.block = blockName;
		this.element.dataset.hidonerror = 'true';
		this.element.style.display = 'none';
		this.element.innerHTML = `
		<span>↓</span>
		<span style="--delay: 0.1s">↓</span>
		<span style="--delay: 0.3s">↓</span>
		<span style="--delay: 0.4s">↓</span>
		<span style="--delay: 0.5s">↓</span>
		`;

		const $parentBlock = document.querySelector(selectorBlock);
		$parentBlock.style.position = 'relative';
		$parentBlock.insertAdjacentElement('beforeend', this.element);
	}

	/**
	 * Включен ли прелоадер
	 *
	 * @returns {boolean}
	 */
	get isActive()
	{
		return this.element.style.display !== 'none';
	}

	show()
	{
		if (!this.isActive)
		{
			document.querySelectorAll(`[data-preload="true"][data-block="${this.block}"]`)
			.forEach(element => element.style.opacity = '0');
			this.element.style.display = 'flex';
		}
	}

	hide()
	{
		if (this.isActive)
		{
			document.querySelectorAll(`[data-preload="true"][data-block="${this.block}"]`)
			.forEach(element => element.style.opacity = '1');
			this.element.style.display = 'none';
		}
	}
}
