document.addEventListener('DOMContentLoaded', async () => {
  const wheel = document.getElementById('wheel');
  const balanceInfo = document.getElementById('balance-info');
  const errorMessage = document.getElementById('error-message');

  // Инициализация Telegram Web App
  const tg = window.Telegram.WebApp;
  tg.expand();
  tg.enableClosingConfirmation();
  
  // Создание главной кнопки
  const mainButton = tg.MainButton;
  mainButton.setText('Вращать');
  
  // Установка цвета кнопки
  mainButton.setParams({
  color: '#E3B0B0', // Цвет кнопки
  });

  mainButton.show();

  const user = tg.initDataUnsafe.user;

  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  };

  if (user) {
    const telegramId = user.id;

    let userData;
    try {
      const response = await fetch(`/api/getUserDataByTelegramId?telegram_id=${telegramId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      userData = await response.json();
      if (!userData.data) throw new Error('User data is empty');
      console.log('Данные пользователя получены:', userData);
    } catch (error) {
      console.error('Ошибка получения данных пользователя по API:', error);
      showError('Ошибка получения данных пользователя по API');
      return;
    }

    let balance = isNaN(userData.data.balance) || userData.data.balance < 0 ? 0 : userData.data.balance;
    let slots = [
      userData.data.slot_1,
      userData.data.slot_2,
      userData.data.slot_3,
      userData.data.slot_4,
      userData.data.slot_5
    ];

    balanceInfo.textContent = `Доступно вращений: ${balance}`;

    mainButton.onClick(async () => {
      if (balance <= 0) {
        tg.showAlert('У вас недостаточно прокруток, пригласите друга и получите +1 бесплатно!');
        return;
      }

      balance -= 1;
      balanceInfo.textContent = `Прокруток: ${balance}`;

      // Логика вращения колеса
      const angle = Math.floor(Math.random() * 360) + 360 * 3; // Вращение на 3 полных круга + случайный угол
      wheel.style.transition = 'transform 4s ease-out';
      wheel.style.transform = `rotate(${angle}deg)`;

      // Выбор случайного слота
      const slotIndex = Math.floor(Math.random() * slots.length);
      slots[slotIndex] = '✅';

      try {
        await fetch('/api/updateUserData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            item_id: userData.data.id,
            data: {
              balance: balance,
              slot_1: slots[0],
              slot_2: slots[1],
              slot_3: slots[2],
              slot_4: slots[3],
              slot_5: slots[4]
            }
          })
        });
        console.log('Данные пользователя обновлены');
      } catch (error) {
        console.error('Ошибка обновления данных пользователя:', error);
        showError('Ошибка обновления данных пользователя');
      }
    });
  } else {
    showError('Не удалось получить данные пользователя. Пожалуйста, перезапустите приложение.');
  }
});
