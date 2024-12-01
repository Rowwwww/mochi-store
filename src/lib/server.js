const nodemailer = require('nodemailer');
const express = require('express');
const app = express();

// 提供靜態檔案
app.use(express.static('src'));


// 創建郵件傳輸器
const transporter = nodemailer.createTransport({
  service: 'gmail',  // 使用 Gmail 發送郵件
  auth: {
    user: 'rachel05140516@gmail.com',  // 替換成你的 Gmail 帳戶
    pass: 'ehoi tqzn getr tyea'    // 這裡是你的 Gmail 密碼
  }
});

// 使用環境變數來保護郵件帳戶密碼
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.GMAIL_USER, // 使用 Gmail 帳戶的郵件地址
    pass: process.env.GMAIL_PASS  // 使用生成的應用密碼
  }
});

function sendOrderEmail(orderDetails) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: orderDetails.email,
      subject: 'Mochi Store 訂單確認',
      text: `親愛的 ${orderDetails.name}，\n\n感謝您的購買！以下是您的訂單詳細資料：\n\n` +
            `訂單編號：${orderDetails.orderId}\n` +
            `收件人姓名：${orderDetails.name}\n` +
            `收件人電話：${orderDetails.phone}\n` +
            `門市名稱：${orderDetails.store}\n` +
            `付款方式：${orderDetails.paymentMethod}\n` +
            `總金額：$${orderDetails.totalAmount}\n\n` +
            `您的商品訂單：\n${orderDetails.items}\n\n` +
            `我們會盡快為您處理訂單，謝謝！`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return reject(error);
      resolve(info.response);
    });
  });
}

// 使用方式：
(async () => {
  try {
    const response = await sendOrderEmail(orderDetails);
    console.log('郵件發送成功:', response);
  } catch (error) {
    console.error('發送郵件失敗:', error);
  }
})();


// 測試發送郵件
const orderDetails = {
  name: 'Rebecca',
  email: 'rachel05140516@gmail.com',
  phone: '0987654321',
  store: 'Mochi Store Taipei',
  paymentMethod: '信用卡',
  totalAmount: '999',
  orderId: 'ORD123456789',
  items: '商品1 - 數量：2 - 單價：$500\n商品2 - 數量：1 - 單價：$499'
};

sendOrderEmail(orderDetails, (error, response) => {
  if (error) {
    console.log('發送郵件失敗:', error);
  } else {
    console.log('郵件發送成功:', response);
  }
});

