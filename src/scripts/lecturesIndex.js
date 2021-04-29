import 'regenerator-runtime/runtime';
import './../styles/lectures.scss';
import {db} from './firebase';
import Preloader from './Preloader';

/**
 * Прелоадер для списка лекций
 *
 * @type {Preloader}
 */
const lecturesPreloader = new Preloader('body', 'lectures');
// Показать прелоадер пока идет загрузка страницы
lecturesPreloader.show('display', 'none');

(async () =>
{
	/**
	 * Доступные лекции
	 *
	 * @type {{id: string, name: string}[]}
	 */
	const lectures = (await db.collection('Lecture').get())?.docs?.map(lecture =>
	{
		const parsedLecture = {};
		parsedLecture.name = lecture.data().name;
		parsedLecture.id = lecture.id;

		return parsedLecture;
	});

	// Если нет доступных лекций
	if (!lectures || lectures.length === 0)
	{
		showError('Нет доступных лекций для оценивания');
		return;
	}

	lectures.forEach(lecture =>
	{
		// Создаем ссылку на оценку лекции
		const $lectureLink = document.createElement('a');
		$lectureLink.href = `lecture/${lecture.id}`;
		$lectureLink.classList.add('lectures-list-lecture');
		$lectureLink.textContent = lecture.name;

		document.querySelector(".lectures-list").insertAdjacentElement("beforeend", $lectureLink);
	});

	lecturesPreloader.hide("display");


	/*------ Функции ------*/

	/**
	 * Показать ошибку
	 *
	 * @param {string} message - Сообщение об ошибке (может быть в формате HTML)
	 */
	function showError(message)
	{
		// Скрыть все, что указано при ошибке
		document.querySelectorAll('[data-hidonerror="true"]').forEach(element => element.style.display = 'none');

		/**
		 * Блок сообщения
		 *
		 * @type {HTMLDivElement}
		 */
		const $messageBlock = document.querySelector('.lectures-message');
		$messageBlock.style.display = 'block';
		$messageBlock.innerHTML = message;
	}
})();
