// TensorFlow.jsとSpeech Commandsライブラリを読み込む
import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';

async function createModel() {
    // Teachable Machineで書き出したモデルのURL
    const URL = "https://あなたのユーザー名.github.io/リポジトリ名/model-folder/";
    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const recognizer = speechCommands.create(
        "BROWSER_FFT", 
        undefined, 
        checkpointURL, 
        metadataURL);

    await recognizer.ensureModelLoaded();
    return recognizer;
}

async function startListening() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // ['授業中', '関連なし', '背景音']

    recognizer.listen(result => {
        // 確率が一番高いものを取得
        const scores = result.scores;
        const maxScoreIndex = scores.indexOf(Math.max(...scores));
        
        console.log(`判定結果: ${classLabels[maxScoreIndex]}`);
        
        if (classLabels[maxScoreIndex] === "授業中") {
            // 画面に「集中！」と出すなどの処理
        }
    }, {
        probabilityThreshold: 0.75 // 75%以上の確信度で反応
    });
}
