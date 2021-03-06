# RateTheLectures

Приложение для оценивания лекций Lab:Code.

## Запуск
Приложение разработано с помощью сервера Node.js и фреймворка web-приложений Express.js.

Установка зависимостей:
```bash
$ npm i
```

Сборка приложения и запуск локального сервера:
```bash
$ npm run start
```

Приложение собирается в папке `dist`, где находятся минифицированные версии исходного кода.

В папке `src` находится исходный код.

Приложение запущено по адресу http://localhost:3000.

## Начинка
* В папке `lectureRate` содержится `index.html` - это основная страница для оценивания лекций.
* В главной папке содержится `index.html`, который показывает список доступных лекций. Также вызывается при обращении к неправильному адресу.
* В папке `styles` содержатся стили для главной страницы и страницы лекции.

### Работа с лекциями
* `lecturesIndex.js` - содержит в себе работу с DOM для главной страницы.
* `lectureIndex.js` - содержит в себе работу с DOM для оценки лекции.
* `config.js` содержит в себе конфигурацию для доступа к Firebase.
* `firebase.js` содержит инициализацию подключения к Firebase.
* `Lecture.js` содержит класс `Lecture`, необходимый для работы с лекциями: получение данных из Firebase и их обработка, а также добавление оценок в БД.
* `Preloader.js`  содержит класс `Preloader`, необходимый для работы с прелоадерами.
* `types.js` содержит в себе типы.

## База данных Firebase
* Приведена к 3 НФ
* Есть возможность добавлять лекции
* Есть возможность добавлять новые виды оценок
