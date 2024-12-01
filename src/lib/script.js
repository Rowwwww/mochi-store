// 確保cart變數只在這裡宣告一次
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 設定倒數計時的時間（例如：1 小時 30 分鐘）
const countdownEndTime = new Date().getTime() + 90 * 60 * 1000; // 90 分鐘後

function updateCountdown() {
    const now = new Date().getTime();
    const distance = countdownEndTime - now;

    if (distance <= 0) {
        document.getElementById('timer').innerText = "折扣結束!";
        clearInterval(countdownInterval);
    } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('timer').innerText = `${hours}時 ${minutes}分 ${seconds}秒`;
    }
}

const countdownInterval = setInterval(updateCountdown, 1000); // 每秒更新一次


// 顯示購物車商品
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>你的購物車是空的。</p>';
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" width="50">
            <p>${item.name}</p>
            <p>價格: NT$${item.price}</p>
            <p>數量: ${item.quantity}</p>
            <button class="remove-item" data-id="${item.id}">移除</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    calculateTotalPrice();
}
// 優惠活動的資料
const currentPromotions = [
    {
        name: "滿額免運",
        description: "滿 NT$1000 免運費",
        condition: 1000, // 設定滿額條件為1000元
        active: true // 活動是否啟用
    },
    {
        name: "滿額贈品",
        description: "購物滿 NT$1500 贈送免費小禮物",
        condition: 1500,
        active: true
    }
];

// 顯示優惠活動
function displayPromotions() {
    const cartTotal = calculateCartTotal(); // 取得購物車總金額
    const promotionsContainer = document.getElementById('promotions');

    // 清空現有內容
    promotionsContainer.innerHTML = '';

    currentPromotions.forEach(promotion => {
        if (promotion.active) {
            const promotionElement = document.createElement('div');
            promotionElement.classList.add('promotion');
            
            // 顯示滿額免運或滿額贈品活動
            if (cartTotal >= promotion.condition) {
                promotionElement.innerHTML = `
                    <p>${promotion.name} - ${promotion.description}</p>
                    <p>您已滿足條件！</p>
                `;
            } else {
                promotionElement.innerHTML = `
                    <p>${promotion.name} - ${promotion.description}</p>
                    <p>再加購 NT$${promotion.condition - cartTotal} 即可享受此優惠！</p>
                `;
            }
            promotionsContainer.appendChild(promotionElement);
        }
    });
}
// 計算總金額
function calculateTotalPrice() {
    let totalPrice = 0;
    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
    });

    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.innerText = `總金額: NT$${totalPrice}`;
    }
}
// 頁面加載時顯示優惠活動
window.addEventListener('DOMContentLoaded', function() {
    displayPromotions(); // 顯示當前優惠活動
});
// 點擊「加入購物車」按鈕
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const productPrice = parseInt(this.getAttribute('data-price'));
        const productName = this.previousElementSibling.previousElementSibling.innerText;
        const productImage = this.previousElementSibling.src;

        const existingItemIndex = cart.findIndex(item => item.id === productId);
        if (existingItemIndex === -1) {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        } else {
            cart[existingItemIndex].quantity++;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    });
});

// 移除商品
document.getElementById('cart-items').addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-item')) {
        const productId = event.target.getAttribute('data-id');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    }
});

// 點擊「結帳」按鈕的行為
document.getElementById('checkout-button').addEventListener('click', function() {
    if (cart.length === 0) {
        alert('購物車為空，無法結帳！');
        return;
    }

    // 計算總金額
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    // 將總金額存入 localStorage
    localStorage.setItem('totalAmount', totalPrice);


    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();

    // 跳轉到付款頁面
    window.location.href = 'payment.html';
    
});

document.getElementById('payment-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    // 從 localStorage 獲取總金額
    const totalPrice = localStorage.getItem('totalAmount');
    
    // 模擬購物車商品資訊
    const cart = [
        { name: '巧克力麻糬', quantity: 2 },
        { name: '草莓麻糬', quantity: 1 }
    ];

    const orderDetails = cart.map(item => `${item.name} x${item.quantity}`).join(', ');

    // 獲取使用者輸入的 Email
    const customerEmail = document.getElementById('email').value;

    // 檢查 Email 是否填寫
    if (!customerEmail) {
        alert('請填寫 Email 地址！');
        return;
    }

    // 呼叫後端 API 發送 Email
   try {
    const response = await emailjs.send('kobe20041124', 'service_c7v0m68', {
        customerEmail: customerEmail,
        orderDetails: orderDetails,
        totalPrice: totalPrice
    }, 'your_user_id');

    if (response.status === 200) {
        alert('訂單確認 Email 已成功發送！');
    } else {
        alert('發送 Email 時發生錯誤，請稍後再試！');
    }
} catch (error) {
    console.error('發送 Email 發生錯誤：', error);
    alert('系統錯誤，請稍後再試！');

    }
});



// 初始化購物車顯示
displayCartItems();
