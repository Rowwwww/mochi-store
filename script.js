// 確保 cart 變數只在這裡宣告一次
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 處理登錄回應
function handleCredentialResponse(response) {
    const userData = parseJwt(response.credential);
    console.log("User data:", userData);
    
    // 可以處理登錄後的邏輯，比如顯示用戶資訊或發送資料到後端
}

// 解析 JWT
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

// 初始化 Google 登錄
function initializeGAPI() {
    gapi.load('auth2', function() {
        gapi.auth2.init({
            client_id: '339731562973-cg62nkbor6p8tkgh34jjj7bq0fig2nkq.apps.googleusercontent.com',  // 用你自己的 Google OAuth 2.0 client ID
            scope: 'profile email'
        }).then(function(auth2) {
            console.log('Google API 初始化成功');
            attachSignin(document.getElementById('signin-button'));  // 假設你有一個 id 為 'signin-button' 的按鈕
        }).catch(function(error) {
            console.error('Google 登錄初始化錯誤:', error);
        });
    });
}

function attachSignin(element) {
    gapi.auth2.getAuthInstance().attachClickHandler(element, {}, 
        function(googleUser) {
            const profile = googleUser.getBasicProfile();
            console.log("登錄用戶的基本資料：");
            console.log("ID: " + profile.getId());
            console.log("名稱: " + profile.getName());
            console.log("電子郵件: " + profile.getEmail());
        },
        function(error) {
            console.log("登錄失敗: ", error);
        });
}

// 調用初始化函數
initializeGAPI();

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
    { name: "滿額免運", description: "滿 NT$1000 免運費", condition: 1000, active: true },
    { name: "滿額贈品", description: "購物滿 NT$1500 贈送免費小禮物", condition: 1500, active: true }
];

// 顯示優惠活動
function displayPromotions() {
    const cartTotal = calculateCartTotal();
    const promotionsContainer = document.getElementById('promotions');
    promotionsContainer.innerHTML = '';

    currentPromotions.forEach(promotion => {
        if (promotion.active) {
            const promotionElement = document.createElement('div');
            promotionElement.classList.add('promotion');
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

// 計算購物車總金額
function calculateCartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// 頁面加載時顯示優惠活動
window.addEventListener('DOMContentLoaded', function() {
    displayPromotions();
    displayCartItems();
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

    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    localStorage.setItem('totalAmount', totalPrice);
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();

    window.location.href = 'payment.html';
});

// 處理支付表單提交
document.getElementById('payment-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const totalPrice = parseFloat(localStorage.getItem('totalAmount')) || 0;
    const orderDetails = cart.map(item => `${item.name} x${item.quantity}`).join(', ');

    console.log('訂單詳細：', orderDetails);

    const apiUrl = 'https://example.com/api/order';
    const orderData = { totalAmount: totalPrice, orderDetails: orderDetails };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': '

// 初始化購物車顯示
displayCartItems();
