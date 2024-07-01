const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/getUserDataByTelegramId', async (req, res) => {
  const { telegram_id } = req.query;
  console.log(`Запрос данных для telegram_id: ${telegram_id}`);
  try {
    const response = await fetch(`https://app.leadteh.ru/api/v1/getListItems?api_token=DOlW2wu8eIkzv2eu5yONxq2SUHrSXlLvRrbsRgDjBjzENmPI2vZpDyIKC6kb&schema_id=666c53ac20bbff05720cdb53&filters[tg_id]=${telegram_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    console.log('Ответ от API:', data);
    if (!data.data || data.data.length === 0) {
      throw new Error('User not found');
    }
    res.json({ data: data.data[0] });
  } catch (error) {
    console.error('Failed to fetch user data by Telegram ID:', error);
    res.status(500).json({ error: 'Failed to fetch user data by Telegram ID' });
  }
});

app.post('/api/updateUserData', async (req, res) => {
  const { item_id, data } = req.body;
  console.log(`Обновление данных для item_id: ${item_id} с данными:`, data);
  try {
    const response = await fetch('https://app.leadteh.ru/api/v1/updateListItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        api_token: 'DOlW2wu8eIkzv2eu5yONxq2SUHrSXlLvRrbsRgDjBjzENmPI2vZpDyIKC6kb',
        schema_id: '666c53ac20bbff05720cdb53',
        item_id: item_id,
        data: data
      })
    });
    const result = await response.json();
    console.log('Ответ от API обновления:', result);
    res.json(result);
  } catch (error) {
    console.error('Failed to update user data:', error);
    res.status(500).json({ error: 'Failed to update user data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
