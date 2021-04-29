import './../styles/preloader.scss';

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

	/**
	 * Показать прелоадер
	 *
	 * @param {string} [property='opacity'] - CSS свойство элементов, которое нужно изменить при показе прелоадера
	 * @param {any} [value='0'] - CSS значение свойства элементов, которое нужно изменить при показе прелоадера
	 */
	show(property = 'opacity', value = '0')
	{
		if (!this.isActive)
		{
			document.querySelectorAll(`[data-preload="true"][data-block="${this.block}"]`)
			.forEach(element =>
			{
				element.dataset[`prev${property}`] = getComputedStyle(element)[property];
				element.style[property] = value;
			});
			this.element.style.display = 'flex';
		}
	}

	/**
	 * Скрытие прелоадера
	 *
	 * @param {string} [property='opacity'] - CSS свойство элементов, которое нужно изменить при скрытии прелоадера
	 */
	hide(property = 'opacity')
	{
		if (this.isActive)
		{
			document.querySelectorAll(`[data-preload="true"][data-block="${this.block}"]`)
			.forEach(element => element.style[property] = element.dataset[`prev${property}`]);
			this.element.style.display = 'none';
		}
	}
}
