# Telegram Bot Web App - Статическая версия

Это статическая версия веб-приложения для Telegram бота, разработанная для размещения на GitHub Pages. Приложение позволяет пользователям бронировать различные услуги компании.

## Возможности

- Бронирование караоке-комнат
- Заказ массажа
- Бронирование отеля
- Заказ эскорт-услуг
- Форма обратной связи
- Прямое взаимодействие с API бота

## Структура проекта

```
static_site/
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── index.html           # Главная страница
├── karaoke.html         # Страница бронирования караоке
├── massage.html         # Страница бронирования массажа
├── hotel.html           # Страница бронирования отеля
├── escort.html          # Страница заказа эскорт-услуг
├── contact.html         # Контактная форма
└── README.md            # Вы сейчас здесь
```

## Установка и использование

### Локальная разработка

1. Клонируйте репозиторий:
   ```bash
   git clone <url-репозитория>
   ```

2. Откройте файл `index.html` в браузере.

3. Настройте URL API бота в файле `js/app.js`:
   ```javascript
   const BOT_API_URL = 'https://your-bot-api-url.com/bot';
   ```

### Размещение на GitHub Pages

1. Создайте новый репозиторий на GitHub или используйте существующий.

2. Загрузите все файлы из папки `static_site` в корень репозитория.

3. В настройках репозитория перейдите в раздел "Pages" и выберите ветку для публикации (обычно `main` или `master`).

4. GitHub автоматически опубликует сайт и предоставит URL для доступа.

## Настройка для Telegram Bot

1. В BotFather создайте или выберите существующего бота.

2. Используйте команду `/mybots`, выберите вашего бота и перейдите в "Bot Settings" > "Menu Button" > "Configure Menu Button".

3. Установите тип кнопки "Web App" и в качестве URL укажите адрес вашего опубликованного сайта на GitHub Pages.

### Настройка API для взаимодействия с ботом

Приложение может работать как в режиме Telegram WebApp (внутри Telegram), так и как обычный веб-сайт. Для взаимодействия с ботом из обычного веб-сайта:

1. Настройте бэкенд для обработки запросов с веб-сайта, используя те же эндпоинты, что и для Telegram WebApp.

2. Реализуйте CORS на стороне сервера для обеспечения безопасности:
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend-domain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. Измените URL API в файле `js/app.js`:
   ```javascript
   const BOT_API_URL = 'https://your-backend-api.com/bot';
   ```

## Безопасность

В приложении реализованы следующие меры безопасности:

- Content Security Policy (CSP) для защиты от XSS-атак
- X-Frame-Options для защиты от кликджекинга
- X-Content-Type-Options для защиты от MIME-сниффинга
- Валидация данных форм на клиентской стороне
- Поддержка Telegram initData для авторизации запросов

## Взаимодействие с API бота

В файле `js/app.js` реализованы следующие функции для взаимодействия с API бота:

1. `sendDataToBot(data, serviceType)` - отправляет данные на сервер бота
2. `getDataFromBot(endpoint, params)` - получает данные от бота

Пример использования:
```javascript
// Отправка данных на сервер
const bookingData = {
    name: "Иван Иванов",
    phone: "79991234567",
    date: "2023-10-15"
};
sendDataToBot(bookingData, 'karaoke')
    .then(response => console.log('Booking successful:', response))
    .catch(error => console.error('Booking failed:', error));

// Получение данных от сервера
getDataFromBot('/available-times', {date: '2023-10-15', service: 'karaoke'})
    .then(availableTimes => console.log('Available times:', availableTimes))
    .catch(error => console.error('Failed to get times:', error));
```

## Адаптация под ваши нужды

Вы можете настроить приложение под свои нужды:

1. Измените услуги в `index.html`
2. Обновите формы бронирования
3. Настройте стили в `css/styles.css`
4. Измените логику обработки форм в `js/app.js`
5. Укажите URL вашего API в `js/app.js` 