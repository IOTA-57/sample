// 1. 変数の初期化と状態管理
let todayCount = 0;
let yesterdayCount = 0;
let lastDetectionTime = 0; // 例外ボタン判定用（タイムスタンプ）
let exceptionWindowMs = 45 * 1000; // 45秒（ミリ秒換算）
let isListening = false;

// UI要素の取得
const countDisplay = document.getElementById('current-count');
const comparisonDisplay = document.getElementById('comparison-count');
const exceptionBtn = document.getElementById('btn-exception');
const statusLog = document.getElementById('status-log');

// 2. 前日比の計算とローカル保存（localStorage活用）
function loadDailyData() {
    const todayStr = new Date().toLocaleDateString();
    const storedDate = localStorage.getItem('lastRecordDate');
    
    // 日付が変わっていたら、昨日のデータとして保存し直す
    if (storedDate !== todayStr) {
        let lastCount = localStorage.getItem('todayCount') || 0;
        localStorage.setItem('yesterdayCount', lastCount);
        localStorage.setItem('todayCount', 0); // 今日のカウントをリセット
        localStorage.setItem('lastRecordDate', todayStr);
    }

    // データの読み込み
    todayCount = parseInt(localStorage.getItem('todayCount')) || 0;
    yesterdayCount = parseInt(localStorage.getItem('yesterdayCount')) || 0;

    updateUI();
}

function saveDailyData() {
    localStorage.setItem('todayCount', todayCount);
}

// 3. カウント処理と「例外（キャンセル）」ロジック
function triggerDetection() //AIが「関係無し」と判断したときの呼ばれる関数 {　
    todayCount++;
    lastDetectionTime = Date.now(); // 検知した時間を記録
    saveDailyData();
    updateUI();
    
    // 例外ボタンを有効化するなどのUI処理
    exceptionBtn.disabled = false;
    logMessage("無駄話を検知しました！(45秒以内ならキャンセル可能)");
}

// 例外ボタンが押された時の処理
function undoLastDetection() {
    const currentTime = Date.now();
    
    // 最後の検知から45秒以内かチェック
    if (currentTime - lastDetectionTime <= exceptionWindowMs) {
        if (todayCount > 0) {
            todayCount--;
            saveDailyData();
            logMessage("前回の検知を取り消しました。");
        }
        // 連続キャンセルを防ぐため時間をリセット
        lastDetectionTime = 0; 
        exceptionBtn.disabled = true;
        updateUI();
    } else {
        logMessage("45秒経過したため、取り消せません。");
        exceptionBtn.disabled = true;
    }
}

// 4. UIの更新用ヘルパー関数
function updateUI() {
    if(countDisplay) countDisplay.innerText = todayCount;
    
    if(comparisonDisplay) {
        const diff = todayCount - yesterdayCount;
        const sign = diff > 0 ? "+" : "";
        comparisonDisplay.innerText = `前日比: ${sign}${diff}回`;
    }
}

function logMessage(text) {
    if(statusLog) {
        statusLog.innerText = text;
        console.log(text);
    }
}

// イベントリスナーの登録
if(exceptionBtn) {
    exceptionBtn.addEventListener('click', undoLastDetection);
}

// 起動時にデータを読み込む
window.onload = () => {
    loadDailyData();
};
