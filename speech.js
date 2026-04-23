// 音声認識 (Web Speech API) の初期設定
// ブラウザ間の差異を吸収
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    alert("お使いのブラウザは音声認識に対応していません。Google Chromeをご利用ください。");
}

const recognition = new SpeechRecognition();
recognition.lang = 'ja-JP'; // 日本語に設定
recognition.interimResults = false; // 確定した結果のみを取得
recognition.continuous = true; // 連続で聞き取るように設定

// 音声認識のイベント処理
recognition.onstart = () => {
    isListening = true; // app.jsで定義した変数
    logMessage("マイクの監視を開始しました...");
};

recognition.onresult = async (event) => {
    // 最新の聞き取り結果を取得
    const lastResultIndex = event.results.length - 1;
    const transcript = event.results[lastResultIndex][0].transcript;
    
    logMessage(`聞き取り: 「${transcript}」`);

    // AIに判定させる (ai.jsの関数)
    // scoreは 0(関連なし) 〜 1(授業中) の間の数値になります
    const score = await classifyText(transcript);
    
    if (score !== undefined) {
        console.log(`AIの判定スコア: ${score.toFixed(3)}`);
        
        // 【閾値（しきいち）の設定】
        // 0.5未満（つまり「関連なし」の確率が高い）ならカウントアップ
        if (score < 0.5) {
            triggerDetection(); // app.jsの関数を呼び出す
        }
    }
};

recognition.onerror = (event) => {
    logMessage(`エラー発生: ${event.error}`);
};

recognition.onend = () => {
    // continuous = true にしていても、無音が続くと停止することがあるため自動再開させる
    if (isListening) {
        recognition.start(); 
    } else {
        logMessage("マイクの監視を停止しました。");
    }
};

// UIボタンから呼ばれる関数
function toggleRecognition() {
    if (isListening) {
        isListening = false;
        recognition.stop();
    } else {
        recognition.start();
    }
}
