document.addEventListener('DOMContentLoaded', function() {
    const promotionsDiv = document.getElementById('promotions');
    
    // 確認 promotionsDiv 是否正確選取
    console.log(promotionsDiv);

    // 模擬的優惠活動
    const promotions = [
        { id: 1, title: "滿$500免運費", description: "購滿NT$500，即可享免運優惠！" },
        { id: 2, title: "滿$300贈送小禮物", description: "購滿NT$300，送可愛小禮物一份！" },
        { id: 3, title: "首購折扣10%", description: "首次購物可享 10% 折扣！" }
    ];

    // 隨機顯示一個優惠活動
    const randomPromotion = promotions[Math.floor(Math.random() * promotions.length)];

    // 確認隨機選擇的優惠是否正確
    console.log(randomPromotion);

    // 動態顯示優惠活動
    promotionsDiv.innerHTML = `
        <div class="promotion">
            <h3>${randomPromotion.title}</h3>
            <p>${randomPromotion.description}</p>
        </div>
    `;
});
