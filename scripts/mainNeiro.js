//https://proglib.io/p/pishem-neyroset-na-python-s-nulya-2020-10-07
let a = 1.6733
let b = 1.0507

/**
 * Лру функция(правильная версия от a и b)
 * @param x - входное значение
 * @returns {number} - выходное значение
 */
function LRU(x){
    if(x > 0){
        return b * x;
    }
    return a*b*(Math.exp(x) - 1);
}

/**
 * производная Лру функции(правильная версия от a и b)
 * @param x - входное значение
 * @returns {number} - выходное значение
 */
function derivLRU(x){
    if(x < 0){
        return a * b * Math.exp(x);
    }
    return b;
}

/**
 * Класс нейросети
 */
class NeuronFullNet{
    learningRate = 0.001

    inputLayersSize = 0
    inputLayers = []

    outputLayerSize = 0
    outputLayer = []

    /**
     * Функция задающая конфигурацию нейросети
     * @param inputLayersSize Размер входного слоя
     * @param outputLayerSize Размер выходного слоя
     */
    setSizes(inputLayersSize, outputLayerSize){
        this.inputLayersSize = inputLayersSize;
        this.outputLayerSize = outputLayerSize;
    }

    /**
     * Функция генерирующая нейроны
     */
    genNeurons(){
        this.inputLayers = [];
        this.outputLayer = []
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers.push(new Neuron());
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer.push(new Neuron());
        }
    }

    /**
     * Функция задающая рандомные веса связям в нейросети
     */
    genRandParam(){
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].setWeights(2500, randParams(2500), randParam());
        }
    }

    /**
     * Функция создающая обьект для сохранения весов нейросети
     * @returns {SaveOBJ} обьект с весами
     */
    toSaveObj(){
        let saveObj = new SaveOBJ;
        for(let i = 0; i < this.outputLayerSize; i++){
            saveObj.outputLayer.push(JSON.parse(JSON.stringify(this.outputLayer[i].weights)))
        }
        return saveObj;
    }

    /**
     * Функция загружающяя веса из обьекта
     * @param saveObj - обьект с весами
     */
    fromSaveObj(saveObj) {
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].setWeights(2500, (JSON.parse(JSON.stringify(saveObj.outputLayer[i]))), randParam());
        }
    }

    /**
     * Функция задающая output входному слою.
     * @param input - значения
     */
    setInput(input){
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers[i].output = input[i];
        }
    }

    /**
     * Функция вычисляющая результат работы нейросети
     */
    genOutput(){
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].result(this.inputLayers);
        }
    }

    /**
     * Тестовая функция печатающая результат работы выходных нейронов
     */
    printOutput(){
        for(let i = 0; i < this.outputLayerSize; i++){
            console.log(this.outputLayer[i].output)
            console.log("\n")
        }
    }

    /**
     * Софтмакс функция. Обрабатывает значения выходных нейронов и приводит их к правильному значению
     */
    softMax(){
        let total = 0
        let maxim = -Infinity
        this.outputLayer.forEach(function (i) {
            maxim = Math.max(maxim,i.output)
        })
        this.outputLayer.forEach(function (i) {
            total += Math.exp(i.output - maxim );
        })
        this.outputLayer.forEach(function (i, index) {
            i.output = Math.exp(i.output - maxim ) / total + 0.000000001;
        })
    }

    /**
     * Функция кросс ентропии
     * @param answer правильный ответ
     * @returns {number} значение кросс ентропии
     */
    crossEntropyForTen(answer){
        let p = [0,0,0,0,0,0,0,0,0,0]
        let q = [0,0,0,0,0,0,0,0,0,0]
        p[answer] = 1;
        for(let i = 0; i < 10; i++){
            q[i] = this.outputLayer[i].output;
        }
        let error = 0;
        for(let i = 0; i < 10; i++){
            error -= p[i] * Math.log(q[i]);
        }

        return error
    }

    /**
     * Вычисление ошибки выходного слоя
     * @param answer правильный ответ
     * @returns {number[]} массив значений ошибок
     */
    countDError(answer){
        let p = [0,0,0,0,0,0,0,0,0,0]
        let q = [0,0,0,0,0,0,0,0,0,0]
        p[answer] = 1;
        for(let i = 0; i < 10; i++){
            q[i] = this.outputLayer[i].output;
        }
        for(let i = 0; i < 10; i++){
            q[i] -= p[i];
        }
        return q;
    }

    /**
     * Функция выдающая итоговый ответ нейросети
     * @returns {number} - ответ
     */
    out(){
        let answer = 0;
        let answerIni = 0;
        for(let i = 0; i < 10; i++){
            if(this.outputLayer[i].output > answerIni){
                answerIni = this.outputLayer[i].output;
                answer = i;
            }
        }
        return answer;
    }

    /**
     * Функция обнуляющая ошибку у нейронов
     */
    setZeroErrors(){
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].error = 0;
        }
    }

    /**
     * Функция вычисляющая t1 нейрона
     * @param n нейрон
     * @param l номер нейрона предыдущего слоя с которым сохраняется связь
     * @returns {number} Значение t1
     */
    t1(n, l){
        return n.error * derivLRU(n.total);
    }

    /**
     * Функция вычисляющая новый вес нейрона
     * @param n нейрон
     * @param l номер нейрона предыдущего слоя с которым сохраняется связь
     * @returns {number} значение нового веса нейрона
     */
    newWeight(n, l){
        let t1 = n.error * derivLRU(n.total);
        let temp = n.weights[l] - t1 * this.learningRate * n.input[l];
        return temp;
    }

    /**
     * Функция обучение нейросети
     * @param answer Верный ответ
     * @returns {number} Ентропия(loss)
     */
    teach(answer){
        this.setZeroErrors()
        this.softMax()
        let loss = this.crossEntropyForTen(answer)

        let dOutput = this.countDError(answer)

        for(let i = 0; i < 10; i++){
            this.outputLayer[i].error = dOutput[i];
        }

        for(let i = 0; i < 10; i++){
            for(let j = 0; j < 2500; j++){
                let newWeight = this.newWeight(this.outputLayer[i], j);
                this.outputLayer[i].weights[j] = newWeight;
            }
        }

        return loss;
    }
}

let inputLayersSize = 2500
let outputLayerSize = 10

let neuroNet = new NeuronFullNet();
neuroNet.setSizes(inputLayersSize, outputLayerSize);
neuroNet.genNeurons()

neuroNet.fromSaveObj(JSON.parse(oldKF))

const iter = document.getElementById('iter');
const clearButton = document.getElementById('clear');
const run = document.getElementById('run');
const canvas = document.getElementById('drawer');
const context = canvas.getContext('2d');
const addButton = document.getElementById('add');
const saveButton = document.getElementById('save');
const saveKButton = document.getElementById('saveK');
const answerInput = document.getElementById('answerInput');
const answer = document.getElementById('answer');
const getButton = document.getElementById('get');
const form = document.getElementById('getter');


let weightCanvas = canvas.width;
let heightCanvas = canvas.height;
let weightCount = 50
let heightCount = 50

let inputNoLine =  new Array(heightCount).fill(0).map( () => new Array(weightCount).fill(0))

let tests = []

function loop() {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height)
    let dx = weightCanvas / weightCount;
    let dy = heightCanvas / heightCount;

    for(let i = 0; i < weightCount; i++){
        for(let j = 0; j < heightCount; j++){
            let temp = inputNoLine[i][j] * 255;

            context.fillStyle = 'rgb(' + temp + "," + temp + "," + temp + ")";
            context.fillRect(dx * j,dy * i , dx, dy);

        }
    }

}

canvas.onmousemove = function drawIfPressed (event) {
    const rectangle = canvas.getBoundingClientRect();
    let x = event.clientX - rectangle.left;
    let y = event.clientY - rectangle.top;

    let dx = weightCanvas / weightCount;
    let dy = heightCanvas / heightCount;
    if (event.buttons === 1){
        for(let i = 0; i < heightCount; i++){
            for(let j = 0; j < weightCount; j++){
                let sx = dx * i;
                let ex = dx * i + dx;
                let sy = dy * j;
                let ey = dy * j + dy;

                if(sx < x && ex > x && sy < y && ey > y) {
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
                if(Math.abs((sx + ex) / 2 - x) < 15 && Math.abs((sy + ey) / 2 - y) < 15){
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
                if(Math.abs((sx + ex) / 2 - x) < 25 && Math.abs((sy + ey) / 2 - y) < 25){
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
            }
        }
    }
    if (event.buttons === 4){
        for(let i = 0; i < heightCount; i++){
            for(let j = 0; j < weightCount; j++){
                let sx = dx * i;
                let ex = dx * i + dx;
                let sy = dy * j;
                let ey = dy * j + dy;

                if(sx < x && ex > x && sy < y && ey > y) {
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
                if(Math.abs((sx + ex) / 2 - x) < 15 && Math.abs((sy + ey) / 2 - y) < 15){
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
                if(Math.abs((sx + ex) / 2 - x) < 25 && Math.abs((sy + ey) / 2 - y) < 25){
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
            }
        }
    }
};

addButton.addEventListener('click', function() {
    let temp = new Test;
    temp.input =  JSON.parse(JSON.stringify(inputNoLine))
    temp.answer = answerInput.value;
    tests.push(temp)
});

clearButton.addEventListener('click', function() {
    inputNoLine =  new Array(heightCount).fill(0).map( () => new Array(weightCount).fill(0))
});

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

saveKButton.addEventListener('click', function() {
    download( JSON.stringify(neuroNet.toSaveObj()), 'json.txt', 'text/plain');
});

saveButton.addEventListener('click', function() {
    download( JSON.stringify(tests), 'json.txt', 'text/plain');
});

iter.addEventListener('click', function() {
    neuroNet.setInput(matrixToLineMatrix(inputNoLine))
    neuroNet.genOutput()
    let a = neuroNet.out();
    answer.innerHTML = a;
    console.log(a);
});


let all = 0;
let good = 0;
run.addEventListener('click', function() {
    for(let e = 0; e < 1000; e++)
    {
        all ++;
        let i = Math.floor(Math.random() * tests.length);
        neuroNet.setInput(matrixToLineMatrix(tests[i].input))
        neuroNet.genOutput()
        let a = "";
        a += i;
        a += " ";
        a += neuroNet.out();
        if(tests[i].answer === neuroNet.out()){
            good ++;
        }
        console.log("--------")
        console.log(good / all)
        console.log(neuroNet.teach(Number(tests[i].answer)))

    }
});

requestAnimationFrame(loop);