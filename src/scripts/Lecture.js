import './types';
import {db} from './firebase';

/**
 * Класс лекции
 */
export default class Lecture
{
	/**
	 * Название лекции
	 *
	 * @private
	 * @type {string}
	 */
	#name;

	/**
	 * Создание экземпляра лекции
	 *
	 * @constructor
	 * @param {string} id - Идентификатор лекции
	 * @return {LectureType} - Лекция
	 */
	constructor(id)
	{
		this.id = id;
	}

	/**
	 * Получение оценок
	 *
	 * @param {string} userId - ID пользователя
	 * @returns {Promise<ScoreType[] | undefined>}
	 */
	async getScores(userId)
	{
		const scores = [];

		/**
		 * Группировка по ключу
		 *
		 * @param {{}[]} array - Массив объектов
		 * @param {string} key - Ключ для группировки
		 */
		const groupBy = (array, key) => array.reduce((acc, element) =>
		{
			(acc[element[key]] = acc[element[key]] || []).push(element);
			return acc;
		}, {});

		/**
		 * Все оценки по лекции
		 *
		 * @type {{scoreId: string, userId: string, lectureId: string}[]}
		 */
		const dirtScores = (await db.collection('LectureScore').where('lectureId', '==', this.id)
		.get())?.docs?.map(score => score.data());

		// Если не удалось получить данные об оценке
		if (dirtScores == null)
		{
			return undefined;
		}

		/**
		 * Выбранные пользователем оценки
		 *
		 * @type {{scoreId: string, userId: string, lectureId: string}[]}
		 */
		const selectedScoresByUser = dirtScores.filter(score => score.userId === userId);

		/**
		 * Сгруппированные оценки по id
		 */
		const scoreGroups = groupBy(dirtScores, 'scoreId');

		/**
		 * Оценки по лекции
		 *
		 * @type {ScoreType[]}
		 */
		for(const [key, value] of Object.entries(scoreGroups))
		{
			const score = (await db.collection('Score').doc(key).get())?.data();

			// Если не удалось получить данные об оценке
			if (score == null)
			{
				continue;
			}

			scores.push({
				id: key,
				value: score.value,
				count: value.length,
				selected: selectedScoresByUser.some(score => score?.scoreId === key),
			});
		}

		return scores;
	}

	/**
	 * Получение названия лекции
	 *
	 * @returns {Promise<string|undefined>}
	 */
	async getName()
	{
		// Если название лекции еще не запрашивали
		if (!this.#name)
		{
			this.#name = (await db.collection('Lecture').doc(this.id).get()).data()?.name;
		}

		return this.#name;
	}

	/**
	 * Добавление оценки в БД
	 *
	 * @param {string} scoreId - ID оценки
	 * @param {string} userId - ID пользователя
	 * @returns {Promise<boolean>} - Добавлена запись
	 */
	async addScore(scoreId, userId)
	{
		return !!(await db.collection('LectureScore').add({lectureId: this.id, scoreId, userId}))?.id;
	}

	/**
	 * Получение всех видов оценок
	 *
	 * @return {Promise<{id: string, iconClass: string, title: string, value: number}[]|undefined>}
	 */
	static async getScores()
	{
		return (await db.collection('Score').get())?.docs?.map(score =>
		{
			const data = score.data();
			data.id = score.id;
			return data;
		});
	}
}
