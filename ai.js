// 1. 学習データの準備
const trainingData = [
    //label=0が関係ない話
    //label=1が関係ある話
    { text: "昨日のテレビ見た？", label: 0 },
    { text: "お腹すいたから早く終わってほしい", label: 0 },
    { text: "あのゲームのガチャ爆死したわ", label: 0 },
    { text: "この数式の解き方がわからない", label: 1 },
    { text: "ここはテストに出る重要なポイントです", label: 1 },
    { text: "歴史の教科書の次のページを開いて", label: 1 }
];

// 2. テキストの前処理（N-gram抽出と単語帳作成）
let vocabulary = []; // AIが覚える「文字の組み合わせ」の辞書

// 文字列を2文字ずつのペア（バイグラム）に分割する関数
// 例: "りんご" -> ["りん", "んご"]
function getBigrams(text) {
    const bigrams = [];
    for (let i = 0; i < text.length - 1; i++) {
        bigrams.push(text.slice(i, i + 2));
    }
    return bigrams;
}

// 辞書（ボキャブラリー）を作る関数
function buildVocabulary(data) {
    const vocabSet = new Set();
    data.forEach(item => {
        const bigrams = getBigrams(item.text);
        bigrams.forEach(bg => vocabSet.add(bg));
    });
    vocabulary = Array.from(vocabSet);
    console.log(`辞書を作成しました（単語数: ${vocabulary.length}）`);
}

// テキストをAIが計算できる数字の配列（ベクトル）に変換する関数
function textToVector(text) {
    const bigrams = getBigrams(text);
    // 辞書にある言葉が含まれていれば1、なければ0の配列を作る
    return vocabulary.map(word => bigrams.includes(word) ? 1 : 0);
}

// 3. AIモデルの構築と学習 (TensorFlow.js)
let model;

async function trainAI() {
    console.log("AIの学習を開始します...");
    buildVocabulary(trainingData);

    // データをテンソル（TensorFlow専用の多次元配列）に変換
    const xs = tf.tensor2d(trainingData.map(item => textToVector(item.text)));
    const ys = tf.tensor2d(trainingData.map(item => [item.label])); // 0 or 1

    // モデルの設計図（ニューラルネットワーク）
    model = tf.sequential();
    
    // 入力層〜隠れ層（単語数の入力を受け取り、16個のニューロンで処理）
    model.add(tf.layers.dense({
        inputShape: [vocabulary.length],
        units: 16,
        activation: 'relu'
    }));
    
    // 出力層（結果を 0〜1 の確率で出力）
    model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
    }));

    // 学習方法の設定
    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    // 学習の実行（50回反復）
    await model.fit(xs, ys, {
        epochs: 50,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                // 学習の進捗をコンソールに表示
                if ((epoch + 1) % 10 === 0) {
                    console.log(`Epoch ${epoch + 1}: 精度(accuracy) = ${logs.acc.toFixed(2)}`);
                }
            }
        }
    });

    console.log("AIの学習が完了しました！");
}

// 4. 新しいテキストを判定する関数
async function classifyText(inputText) {
    if (!model) {
        console.error("AIがまだ学習していません！");
        return;
    }

    // 入力された文字をベクトル化
    const vector = textToVector(inputText);
    const tensor = tf.tensor2d([vector]);

    // AIに推論させる
    const prediction = model.predict(tensor);
    const score = await prediction.data(); // 0(関連なし) 〜 1(授業中) の間の数値
    
    // メモリ解放
    tensor.dispose(); 
    prediction.dispose();

    return score[0];
}

// 起動時に自動で学習を開始させる（実際の運用ではボタン等で発火させても良いです）
trainAI();
