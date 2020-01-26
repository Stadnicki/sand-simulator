const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const settingsForm = document.getElementById('settings-form');
const sandDensitySlider = document.getElementById('sandDensity');
const simulationSpeedSlider = document.getElementById('simulationSpeed');
const canvasDiv = document.getElementById('canvas-div');
const sandColorInput = document.getElementById('sandColorInput');
const shapeColorInput = document.getElementById('shapeColorInput');
const backgroundColorInput = document.getElementById('backgroundColorInput');
const shapeOptionsSelect = document.getElementById('shapeOptionsSelect');
const algorithmOptionsSelect = document.getElementById('algorithmOptionsSelect');
let boundaryAbsorbing = false;

let nextStepFunction;
let sandDensity = 30;
let simulationSpeed = 30;
let sandColor = "#c2b280";
let shapeColor = "black";
let backgroundColor = "white";
let simulationInterval;
let arrayToWorkOn;
let shapeOptions = Object.keys(sandContainers);

window.onload = () => {
    init();
}

const margolusTransformation = {
    '0020': '2000',
    '0002': '0200',
    '2020': '0220',
    '0220': '2200',
    '2002': '2200',
    '0202': '2200',
    '2022': '2220',
    '0222': '2202',
    '0022': '2200'
}

const margolusTransformationForBoundaryAbsorbing = {
    ...margolusTransformation,
    '1122': '1100',
    '1020': '1000',
    '0102': '0100',
    '1121': '1101',
    '1112': '1110',
    '1102': '1100',
    '1120': '1100'
}

const init = () => {
    shapeOptions.forEach(optionText => {
        let option = document.createElement("option");
        option.text = optionText;
        shapeOptionsSelect.add(option);
    });
}

const copyTwoDimArray = (array) => {
    let newArray = []
    array.forEach((element, index) => {
        newArray[index] = [...element];
    });
    return newArray;
}

const prepareSimulation = () => {
    clearInterval(simulationInterval);
    switch(algorithmOptionsSelect.value) {
        case 'margolus':
            boundaryAbsorbing = false;
            nextStepFunction = margolusNeighborhoodNextStep;
            break;
        case 'stadnicki':
            boundaryAbsorbing = false;
            nextStepFunction = nextStep;
            break;
        case 'boundary':
            boundaryAbsorbing = true;
            nextStepFunction = margolusNeighborhoodNextStep;
            break;
    }
    sandDensity = sandDensitySlider.value;
    simulationSpeed = simulationSpeedSlider.value;
    sandColor = sandColorInput.value;
    shapeColor = shapeColorInput.value;
    backgroundColor = backgroundColorInput.value;
    arrayToWorkOn = copyTwoDimArray(sandContainers[shapeOptionsSelect.value]);
}

const startSimulation = () => {
    prepareSimulation();
    settingsForm.style.display = "none";
    canvasDiv.style.display = "block";
    drawFromArray(arrayToWorkOn);
    generateSand(arrayToWorkOn, sandColor);
    simulationInterval = setInterval(simulation, simulationSpeed);
}

const restartSimulation = () => {
    clearInterval(simulationInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    arrayToWorkOn = copyTwoDimArray(sandContainers[shapeOptionsSelect.value]);
    startSimulation();
}

const showSettings = () => {
    settingsForm.style.display = "block";
    canvasDiv.style.display = "none";
}

const printCell = (array, x, y) => {
    switch(array[y][x]) {
        case 1:
            ctx.fillStyle = shapeColor;
            ctx.fillRect(x*10, y*10, 10, 10);
            break;
        case 2:
            ctx.fillStyle = sandColor;
            ctx.fillRect(x*10, y*10, 10, 10);
            break;
        case 0:
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x*10, y*10, 10, 10);
            break;
    }
}

const drawFromArray = (array) => {
    const xArraySize = array.length;
    const yArraySize = array[0].length;

    for(let x = 0; x < xArraySize; x++) {
        for(let y = 0; y < yArraySize; y++) {
            printCell(array, x, y);
        }
    }
}

// probability from 0 to 100
const getBooleanWithProbability = (probability) => {
    const x = Math.random();
    const y = probability/100.0;
    const z =  Math.random() < (probability/100.0);
    return z;
}

const generateSand = (array, color) => {
    ctx.fillStyle = color;
    xSandField = array.length;
    ySandField = Math.trunc(array[0].length / 2);

    for(let x = 0; x < xSandField; x++) {
        for(let y = 0; y < ySandField; y++) {
            if(getBooleanWithProbability(sandDensity)) {
                array[y][x] = 2;
                ctx.fillRect(x*10, y*10, 10, 10);
            }
        }
    }
}

const shuffleArray = (array) => {
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

const updateMargolusCell = (sourceArray, cellArray) => {
    cellArray.forEach(coords => {
        printCell(sourceArray, coords[0], coords[1])
    });
} 

const margolusNeighborhoodNextStep = (array) => {
    const xArraySize = array.length;
    const yArraySize = array[0].length;
    let margolusMap;
    margolusMap = boundaryAbsorbing ? margolusTransformationForBoundaryAbsorbing : margolusTransformation;
    for(let y = yArraySize - 1; y > 0; y --) {
        for(let x = 0; x < xArraySize - 1; x++) {
            const currentCell = '' + array[y][x] + array[y][x+1] + array[y-1][x] + array[y-1][x+1];    
            if(currentCell in margolusMap) {
                array[y][x] = parseInt(margolusMap[currentCell][0]);
                array[y][x+1] = parseInt(margolusMap[currentCell][1]);
                array[y-1][x] = parseInt(margolusMap[currentCell][2]);
                array[y-1][x+1] = parseInt(margolusMap[currentCell][3]);
                updateMargolusCell(array, [[x, y], [x+1, y], [x, y-1], [x+1, y-1]]);
            }
        }
    }
}

const nextStep = (array) => {
    const options = [-1, 1];
    const xArraySize = array.length;
    const yArraySize = array[0].length;
    let xArray = new Array(60);
    let currentX = 0;
    for(let i = 0; i < 60; i++) {
        xArray[i] = i;
    }
    for(let y = yArraySize - 2; y >= 0; y--) {
        shuffleArray(xArray);
        for(let x = 0; x < xArraySize; x++) {
            shuffleArray(options);
            currentX = xArray[x];
            if(y === 0 || y === 1)
                debugger;
            if(array[y][currentX] === 2) {
                if(array[y+1][currentX] === 0) {
                    array[y][currentX] = 0;
                    array[y+1][currentX] = 2;

                    drawRectangle(currentX, y, backgroundColor);
                    drawRectangle(currentX, y + 1, sandColor);
                }
                else if(currentX < xArraySize &&
                    array[y + 1][currentX + options[0]] === 0) {
                        array[y][currentX] = 0;
                        array[y + 1][currentX + options[0]] = 2;

                        drawRectangle(currentX, y, backgroundColor);
                        drawRectangle(currentX + options[0], (y+1), sandColor);
                } 
                else if(xArraySize > 0 && array[y + 1][currentX + options[1]] === 0) {
                        array[y][currentX] = 0;
                        array[y + 1][currentX + options[1]] = 2;

                        drawRectangle(currentX, y, backgroundColor);
                        drawRectangle(currentX + options[1], y + 1, sandColor);
                }
            }
        }
    }
}

const drawRectangle = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*10, y*10, 10, 10);
}

const simulation = () => {
    nextStepFunction(arrayToWorkOn);
}