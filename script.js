// 確保 cart 變數只宣告一次
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// 處理 Google 登錄回應
function handleCredentialResponse(response) {
    const userData = parseJwt(response.credential);
    console.log("User data:", userData);
    // 這裡可以處理登錄後的邏輯，比如顯示用戶資訊或發送資料到後端
}

// 解析 JWT
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join('')
    );
    return JSON.parse(jsonPayload);
}

// 初始化 Google API 登錄
function initializeGAPI() {
    gapi.load('auth2', function () {
        gapi.auth2.init({
            client_id: '339731562973-cg62nkbor6p8tkgh34jjj7bq0fig2nkq.apps.googleusercontent.com',
            scope: 'profile email'
        })
        .then(() => {
            console.log('Google API 初始化成功');
            attachSignin(document.getElementById('signin-button')); // 假設有一個 id 為 signin-button 的按鈕
        })
        .catch(error => {
            console.error('Google 登錄初始化錯誤:', error);
        });
    });
}

// 綁定 Google 登錄按鈕
function attachSignin(element) {
    gapi.auth2.getAuthInstance().attachClickHandler(element, {},
        googleUser => {
            const profile = googleUser.getBasicProfile();
            console.log("登錄成功，用戶資料：");
            console.log("ID:", profile.getId());
            console.log("名稱:", profile.getName());
            console.log("電子郵件:", profile.getEmail());
        },
        error => {
            console.error("登錄失敗:", error);
        }
    );
}

// 顯示購物車商品
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>你的購物車是空的。</p>';
        updateTotalPrice(); // 確保總金額為 0
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

    updateTotalPrice(); // 更新總金額
}

// 更新總金額
function updateTotalPrice() {
    const totalAmount = calculateCartTotal();
    localStorage.setItem('totalAmount', totalAmount); // 同步到 localStorage
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = `總金額: NT$${totalAmount}`;
    }
}

// 計算購物車總金額
function calculateCartTotal() {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// 顯示優惠活動
function displayPromotions() {
    const cartTotal = calculateCartTotal();
    const promotionsContainer = document.getElementById('promotions');
    promotionsContainer.innerHTML = '';

    const currentPromotions = [
        { name: "滿額免運", description: "滿 NT$1000 免運費", condition: 1000, active: true },
        { name: "滿額贈品", description: "購物滿 NT$1500 贈送免費小禮物", condition: 1500, active: true }
    ];

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

// 點擊「加入購物車」按鈕
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function () {
        const productId = this.getAttribute('data-id');
        const productPrice = parseInt(this.getAttribute('data-price'));
        const productName = this.getAttribute('data-name');
        const productImage = this.getAttribute('data-image');

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
        displayPromotions();
    });
});

// 移除商品
document.getElementById('cart-items').addEventListener('click', function (event) {
    if (event.target.classList.contains('remove-item')) {
        const productId = event.target.getAttribute('data-id');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        displayPromotions();
    }
});

// 點擊「結帳」按鈕
document.getElementById('checkout-button').addEventListener('click', function () {
    if (cart.length === 0) {
        alert('購物車為空，無法結帳！');
        return;
    }

    const totalPrice = calculateCartTotal();
    localStorage.setItem('totalAmount', totalPrice); // 儲存總金額
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart)); // 清空購物車
    displayCartItems();

    window.location.href = 'payment.html'; // 跳轉到付款頁面
});

// 初始化頁面
window.addEventListener('DOMContentLoaded', function () {
    displayCartItems();
    displayPromotions();
    initializeGAPI();
});



