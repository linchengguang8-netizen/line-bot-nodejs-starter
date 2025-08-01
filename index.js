const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');

const config = {
  channelAccessToken: 'VW1gH/VdSkDjIFN8FiKAk6QYqECb9IStup5QNk2uDS099hTYoQbl0h3RNGdtcqm6qRCN+yeMQksPvV69DqL33c9Ud8Mpk3eMA7mTWO00PgHx1l8A8EL4Vv0vRvnLvNX3YOIRDu4f9gUUz2Y0M300igdB04t89/1O/w1cDnyilFU=',
  channelSecret: '4ab1b547315610ff011cfc5d9a362725',
};

const app = express();

// LINE middleware
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('Webhook error:', err);
      res.status(500).end();
    });
});

const client = new line.Client(config);

// 處理事件
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const userMessage = event.message.text;
  const userId = event.source.userId;

  // ✅ 根據關鍵字自動貼標籤
  if (userMessage === '我要報名') {
    const tagId = '你要貼的tagId'; // ← 改成你的 tagId
    await tagUser(userId, tagId);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '已為你貼上標籤 🙌',
    });
  }

  // ✅ 一般回應
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `你說的是：「${userMessage}」`,
  });
}

// ✅ 自動幫用戶貼標籤的函式
async function tagUser(userId, tagId) {
  try {
    await axios.post(
      `https://api.line.me/v2/bot/user/${userId}/tag/${tagId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${config.channelAccessToken}`,
        },
      }
    );
    console.log(`已貼標籤 ${tagId} 給使用者 ${userId}`);
  } catch (err) {
    console.error('貼標籤失敗：', err.response?.data || err.message);
  }
}

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
