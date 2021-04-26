import 'regenerator-runtime/runtime';
import './../styles/lecture.scss';
import {db} from './firebase';
import Lecture from './Lecture';
import Preloader from './Preloader';

/**
 * Прелоадер для блока лекции
 *
 * @type {Preloader}
 */
const lecturePreloader = new Preloader('.lecture', 'lecture');
// Показать прелоадер пока идет загрузка страницы
lecturePreloader.show();

(async function()
{
	/**
	 * ID лекции
	 *
	 * @type {string}
	 */
	const lectureId = location.pathname.split('/').slice(-2, -1)[0].toLowerCase();

	/**
	 * Лекция для оценивания
	 *
	 * @type {Lecture}
	 */
	const lecture = new Lecture(lectureId);

	/**
	 * Название лекции
	 *
	 * @type {string}
	 */
	const lectureName = await lecture.getName();

	// Если такой лекции не существует
	if (lectureName == null)
	{
		showError('<p>Лекция указана неправильно</p><p>Проверьте название лекции</p>');
		return;
	}

	// Добавляем название лекции
	document.querySelector('.lecture-header').textContent = lectureName;

	/**
	 * Загрузилась ли статистика
	 *
	 * @type {boolean}
	 */
	const isStatisticsLoaded = await loadStatistics(lecture);

	if (!isStatisticsLoaded)
	{
		showError('<p>Не удалось загрузить оценки</p><p>Попробуйте обновить страницу</p>');
		return;
	}

	// Скрыть прелоадер после загрузки страницы
	lecturePreloader.hide();


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
		const $messageBlock = document.querySelector('.lecture-message');
		$messageBlock.style.display = 'block';
		$messageBlock.innerHTML = message;
	}

	/**
	 * Показать сообщение
	 *
	 * @param {string} message - Сообщение (может быть в формате HTML)
	 */
	function showMessage(message)
	{
		/**
		 * Блок сообщения
		 *
		 * @type {HTMLDivElement}
		 */
		const $messageBlock = document.querySelector('.lecture-message');
		$messageBlock.style.display = 'block';
		$messageBlock.innerHTML = message;
	}

	/**
	 * Получение ID пользователя из куки
	 *
	 * @returns {string | null}
	 */
	function getUserId()
	{
		const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
		return match && match[2];
	}

	/**
	 * Установка ID пользователя в куки
	 *
	 * @param {string} id - ID пользователя
	 */
	function setUserId(id)
	{
		document.cookie = `userId=${id}; expires=Fri, 31 Dec 2100 23:59:59 GMT`;
	}

	/**
	 * Загрузка статистики на страницу
	 *
	 * @param {Lecture} lecture - Лекция
	 * @returns {Promise<boolean>} - true - успешно, false - с ошибками
	 */
	async function loadStatistics(lecture)
	{
		// Показать прелоадер пока идет загрузка статистики
		lecturePreloader.show();

		document.querySelectorAll('.lecture-statistics-scores, .lecture-rate')
		.forEach(element => element.innerHTML = '');

		/**
		 * Все виды оценок
		 *
		 * @type {{id: string, iconClass: string, title: string, value: number}[] | undefined}
		 */
		const allScores = await Lecture.getScores();

		// Если не удалось получить оценки
		if (allScores == null)
		{
			lecturePreloader.hide();
			return false;
		}

		// Сортировка по убыванию значимости оценки
		allScores.sort((score1, score2) => score2.value - score1.value);

		/**
		 * Оценки лекции
		 *
		 * @type {ScoreType[] | undefined}
		 */
		const lectureScores = await lecture.getScores(getUserId());

		// Если не удалось получить оценки лекции
		if (lectureScores == null)
		{
			lecturePreloader.hide();
			return false;
		}

		/**
		 * Выбранная пользователем оценка
		 *
		 * @type {ScoreType | undefined}
		 */
		const selectedScoreByUser = lectureScores.find(score => score.selected);

		/**
		 * Количество всех оценок лекции
		 *
		 * @type {number}
		 */
		const countScores = lectureScores.reduce((sum, score) => sum + score.count, 0);

		allScores.forEach(score =>
		{
			// Если пользователь не выбрал оценку
			if (selectedScoreByUser == null)
			{
				// Добавляем оценки
				const $scoreElement = document.createElement('span');
				$scoreElement.classList.add('material-icons', 'lecture-rate-icon');
				$scoreElement.setAttribute('title', score.title);
				$scoreElement.dataset.id = score.id;
				$scoreElement.textContent = score.iconClass;
				$scoreElement.addEventListener('click', async (event) =>
				{
					/**
					 * Цель нажатия
					 *
					 * @type {HTMLDivElement}
					 */
					const target = event.target;
					/**
					 * ID оценки
					 *
					 * @type {string}
					 */
					const scoreId = target.dataset.id;
					/**
					 * ID пользователя
					 *
					 * @type {string | null}
					 */
					const userId = getUserId();

					/**
					 * ID пользователя
					 *
					 * @type {string}
					 */
					let user;
					if (userId != null && (await db.collection('User').doc(userId).get())?.data())
					{
						user = userId;
					} else
					{
						user = (await db.collection('User').add({}))?.id;
						if (user == null) {
							showError('Не удалось добавить пользователя');
							return;
						}
						setUserId(user);
					}

					if (!(await lecture.addScore(scoreId, user)))
					{
						showError('Не удалось поставить оценку');
						return;
					}

					await loadStatistics(lecture);
				});

				document.querySelector('.lecture-rate').insertAdjacentElement('beforeend', $scoreElement);
			} else
			{
				showMessage('Спасибо за ваш голос!');
			}

			// Добавление статистики

			/**
			 * Блок статистики
			 *
			 * @type {HTMLDivElement}
			 */
			const $statisticElement = document.createElement('div');
			$statisticElement.classList.add('lecture-statistics-scores-score');
			$statisticElement.setAttribute('title', score.title);

			/**
			 * Иконка оценки
			 *
			 * @type {HTMLSpanElement}
			 */
			const $statisticIconElement = document.createElement('span');
			$statisticIconElement.classList.add('material-icons', 'lecture-statistics-scores-score-icon');
			$statisticIconElement.textContent = score.iconClass;
			$statisticElement.insertAdjacentElement('beforeend', $statisticIconElement);

			/**
			 * Блок количества выбранной оценки
			 *
			 * @type {HTMLSpanElement}
			 */
			const $statisticProgressElement = document.createElement('span');
			$statisticProgressElement.classList.add('lecture-statistics-scores-score-progress');

			/**
			 * Оценка лекции текущей итерации оценок
			 *
			 * @type {ScoreType}
			 */
			const lectureScore = lectureScores.find(lectureScore => lectureScore.value === score.value);

			/**
			 * Процент текущей оценки от всего количества оценок
			 *
			 * @type {string}
			 */
			let countPercent;

			// Если оценка на текущей итерации не была поставлена для этой лекции
			if (!lectureScore)
			{
				countPercent = '0';
			} else
			{
				countPercent = ((lectureScore.count / countScores) * 100).toFixed(2);
			}

			$statisticProgressElement.textContent = String(lectureScore ? lectureScore.count : 0);
			// Прогресс-бар
			$statisticProgressElement.style.background = `linear-gradient(90deg, #a7e1e5 ${countPercent}%, #E5E5E5 ${countPercent}%)`;
			// Если пользователь выбрал эту оценку
			if (selectedScoreByUser != null && score.id === selectedScoreByUser.id)
			{
				$statisticProgressElement.style.border = '2px solid #208022';
			}
			$statisticElement.insertAdjacentElement('beforeend', $statisticProgressElement);

			// Добавление статистики на страницу
			document.querySelector('.lecture-statistics-scores').insertAdjacentElement('beforeend', $statisticElement);
		});

		lecturePreloader.hide();
		return true;
	}
})();
