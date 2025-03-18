// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();

// Базовый URL API бота (замените на свой URL)
const BOT_API_URL = 'http://85.236.188.185/api';

// Устанавливаем тему в зависимости от настроек Telegram
document.addEventListener('DOMContentLoaded', function() {
    // Применяем темную тему, если она выбрана в Telegram
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Инициализация всех модальных окон
    const forms = document.querySelectorAll('.service-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm(form.id);
        });
    });

    // Установка текущей даты как минимальной для выбора
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.min = today;
    });

    // Инициализация кнопки "Назад"
    const backBtn = document.getElementById('backButton');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.history.back();
        });
    }

    // Проверяем наличие параметра error в URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
        showError(decodeURIComponent(urlParams.get('error')));
    }
});

// Функция для отправки формы
function submitForm(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    let data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Получаем тип сервиса из ID формы
    const serviceType = formId.replace('-form', '');
    data.service_type = serviceType;
    
    // Валидация данных формы
    if (!validateForm(data)) {
        return;
    }
    
    // Добавляем информацию о пользователе из Telegram, если она доступна
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        data.telegram_user = {
            id: tg.initDataUnsafe.user.id,
            username: tg.initDataUnsafe.user.username,
            first_name: tg.initDataUnsafe.user.first_name,
            last_name: tg.initDataUnsafe.user.last_name
        };
    }

    // Показываем индикатор загрузки
    showLoading(true);

    // Если открыто в Telegram WebApp, используем Telegram API
    if (tg.initData) {
        try {
            // Отправляем данные через Telegram WebApp
            tg.sendData(JSON.stringify(data));
            // Показываем сообщение об успехе
            showSuccessMessage(serviceType);
            // Сбрасываем форму
            form.reset();
        } catch (error) {
            console.error('Telegram WebApp error:', error);
            showError('Произошла ошибка при отправке данных в Telegram. Пожалуйста, попробуйте позже.');
        } finally {
            // Скрываем индикатор загрузки
            showLoading(false);
        }
    } else {
        // Иначе отправляем через обычный API запрос
        sendDataToBot(data, serviceType)
            .then(() => {
                showSuccessMessage(serviceType);
                form.reset();
            })
            .catch(error => {
                console.error('Error sending data:', error);
                const errorMessage = error.message || 'Произошла ошибка при отправке данных. Пожалуйста, попробуйте позже.';
                
                // Если ошибка серьезная, переходим на страницу ошибки
                if (error.status >= 500 || error.status === 0) {
                    redirectToErrorPage(errorMessage, window.location.href);
                } else {
                    showError(errorMessage);
                }
            })
            .finally(() => {
                // Скрываем индикатор загрузки
                showLoading(false);
            });
    }
}

// Функция для отправки данных боту через API
async function sendDataToBot(data, serviceType) {
    try {
        // Показываем индикатор загрузки
        showLoading(true);
        
        // Определяем эндпоинт в зависимости от типа сервиса
        let endpoint;
        switch(serviceType) {
            case 'karaoke':
                endpoint = '/karaoke-booking';
                break;
            case 'massage':
                endpoint = '/massage-booking';
                break;
            case 'hotel':
                endpoint = '/hotel-booking';
                break;
            case 'escort':
                endpoint = '/service-booking';
                break;
            case 'contact':
                endpoint = '/contact';
                break;
            default:
                endpoint = '/booking';
        }

        // Отправляем запрос к API бота
        const response = await fetch(BOT_API_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Добавляем инициализационные данные Telegram, если они доступны
                ...(tg.initData ? {'Telegram-Data': tg.initData} : {})
            },
            body: JSON.stringify(data)
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Неизвестная ошибка' }));
            const error = new Error(errorData.detail || 'Ошибка отправки данных');
            error.status = response.status;
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Добавляем статус ошибки, если его еще нет
        if (!error.status) {
            error.status = 0; // Сетевая ошибка или CORS
        }
        throw error;
    } finally {
        // Скрываем индикатор загрузки
        showLoading(false);
    }
}

// Функция для получения данных от бота
async function getDataFromBot(endpoint, params = {}) {
    try {
        // Показываем индикатор загрузки
        showLoading(true);
        
        // Формируем URL с параметрами
        const url = new URL(BOT_API_URL + endpoint);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        // Отправляем запрос к API бота
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                // Добавляем инициализационные данные Telegram, если они доступны
                ...(tg.initData ? {'Telegram-Data': tg.initData} : {})
            }
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Неизвестная ошибка' }));
            const error = new Error(errorData.detail || 'Ошибка получения данных');
            error.status = response.status;
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Добавляем статус ошибки, если его еще нет
        if (!error.status) {
            error.status = 0; // Сетевая ошибка или CORS
        }
        
        // Если ошибка серьезная, переходим на страницу ошибки
        if (error.status >= 500 || error.status === 0) {
            redirectToErrorPage(error.message || 'Ошибка получения данных', window.location.href);
        } else {
            showError(error.message || 'Ошибка получения данных');
        }
        
        throw error;
    } finally {
        // Скрываем индикатор загрузки
        showLoading(false);
    }
}

// Функция для отображения ошибки
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
        
        // Скрыть сообщение через 5 секунд
        setTimeout(function() {
            errorContainer.style.display = 'none';
        }, 5000);
    } else {
        // Если контейнер ошибок не найден, используем alert
        alert(message);
    }
}

// Функция для перенаправления на страницу ошибки
function redirectToErrorPage(message, returnUrl) {
    let url = 'error.html';
    
    // Добавляем параметры
    if (message || returnUrl) {
        url += '?';
        if (message) {
            url += 'message=' + encodeURIComponent(message);
        }
        if (returnUrl) {
            url += (message ? '&' : '') + 'return=' + encodeURIComponent(returnUrl);
        }
    }
    
    // Перенаправляем на страницу ошибки
    window.location.href = url;
}

// Функция для отображения/скрытия индикатора загрузки
function showLoading(show) {
    // Проверяем, существует ли индикатор загрузки
    let loadingIndicator = document.getElementById('loading-indicator');
    
    // Если индикатора загрузки нет и его нужно показать, создаем его
    if (!loadingIndicator && show) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.className = 'loading-overlay';
        loadingIndicator.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
        `;
        document.body.appendChild(loadingIndicator);
    }
    
    // Показываем или скрываем индикатор загрузки
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

// Функция для валидации формы
function validateForm(data) {
    // Проверка на пустые поля
    for (let key in data) {
        if (data[key].trim() === '' && key !== 'additional_info' && key !== 'email') {
            showError('Пожалуйста, заполните все обязательные поля');
            return false;
        }
    }
    
    // Валидация телефона
    if (data.phone && !validatePhone(data.phone)) {
        showError('Пожалуйста, введите корректный номер телефона');
        return false;
    }
    
    // Валидация email, если он есть
    if (data.email && data.email.trim() !== '' && !validateEmail(data.email)) {
        showError('Пожалуйста, введите корректный email');
        return false;
    }
    
    return true;
}

// Функция для валидации телефона
function validatePhone(phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
}

// Функция для валидации email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Функция для отображения сообщения об успехе
function showSuccessMessage(serviceType) {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const serviceNameElement = document.getElementById('serviceName');
    
    // Устанавливаем название сервиса
    switch(serviceType) {
        case 'karaoke':
            serviceNameElement.textContent = 'караоке';
            break;
        case 'massage':
            serviceNameElement.textContent = 'массаж';
            break;
        case 'hotel':
            serviceNameElement.textContent = 'отель';
            break;
        case 'escort':
            serviceNameElement.textContent = 'эскорт-услуги';
            break;
        default:
            serviceNameElement.textContent = 'услугу';
    }
    
    successModal.show();
} 
