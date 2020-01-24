const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sandColor = "#c2b280";
let sandDensity = 30;
let simulationSpeed = 30;
const settingsForm = document.getElementById('settings-form');
const sandDensitySlider = document.getElementById('sandDensity');
const simulationSpeedSlider = document.getElementById('simulationSpeed');
const canvasDiv = document.getElementById('canvas-div');
let simulationInterval;
let arrayToWorkOn = [...sandContainers.hourglass];
let shapeOptions = Object.keys(sandContainers);
const shapeOptionsSelect = document.getElementById('shapeOptionsSelect');
console.log(shapeOptions);

shapeOptions.forEach(optionText => {
    let option = document.createElement("option");
    option.text = optionText;
    shapeOptionsSelect.add(option);
});

const startSimulation = () => {
    sandDensity = sandDensitySlider.value;
    simulationSpeed = simulationSpeedSlider.value;
    arrayToWorkOn = sandContainers[shapeOptionsSelect.value];
    console.log(`Settings: sand density: ${sandDensity} simultion speed: ${simulationSpeed}`)
    settingsForm.style.display = "none";
    canvasDiv.style.display = "block";
    drawTemplate(arrayToWorkOn, "black");
    generateSand(arrayToWorkOn, sandColor);
    simulationInterval = setInterval(simulation, simulationSpeed);
}

const restartSimulation = () => {
    clearInterval(simulationInterval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    arrayToWorkOn = [...sandContainers.dish]
    drawTemplate(sandContainers.dish, "black");
    generateSand(sandContainers.dish, sandColor);
    console.log(sandContainers.dish);
    simulationInterval = setInterval(simulation, simulationSpeed);
}

const showSettings = () => {
    settingsForm.style.display = "block";
    canvasDiv.style.display = "none";
}

const drawTemplate = (array, color) => {
    ctx.fillStyle = color;
    const xArraySize = array.length;
    const yArraySize = array[0].length;
    for(let x = 0; x < xArraySize; x++) {
        for(let y = 0; y < yArraySize; y++) {
            if(array[y][x] === 1) {
                ctx.fillRect(x*10, y*10, 10, 10);
            }
        }
    }
}

const drawFromArray = (array) => {
    const xArraySize = array.length;
    const yArraySize = array[0].length;
    for(let x = 0; x < xArraySize; x++) {
        for(let y = 0; y < yArraySize; y++) {
            switch(array[y][x]) {
                case 1:
                    ctx.fillStyle = "black";
                    ctx.fillRect(x*10, y*10, 10, 10);
                    break;
                case 2:
                    ctx.fillStyle = sandColor;
                    ctx.fillRect(x*10, y*10, 10, 10);
                    break;
                case 0:
                    ctx.fillStyle = "white";
                    ctx.fillRect(x*10, y*10, 10, 10);
                    break;
            }
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

const nextStep = (array) => {
    const options = [-1, 1];
    const arrayCopy = array.slice();
    const xArraySize = array.length;
    const yArraySize = array[0].length;
    let xArray = new Array(60);
    let currentX = 0;
    for(let i = 0; i< 60; i++) {
        xArray.push(i);
    }
    for(let y = yArraySize - 2; y >= 0; y--) {
        for(let x = 0; x < xArraySize; x++) {
            shuffleArray(xArray);
            shuffleArray(options);
            currentX = xArray[x];
            if(array[y][currentX] === 2) {
                if(array[y+1][currentX] === 0) {
                    arrayCopy[y][currentX] = 0;
                    arrayCopy[y+1][currentX] = 2;
                } 
                else if(currentX < xArraySize && array[y + 1][currentX + options[0]] === 0 && arrayCopy[y + 1][currentX + options[0]] !== 2) {
                    arrayCopy[y][currentX] = 0;
                    arrayCopy[y + 1][currentX + options[0]] = 2;
                } 
                else if(xArraySize > 0 && array[y + 1][currentX + options[1]] === 0 && arrayCopy[y + 1][currentX + options[1]] !== 2) {
                    arrayCopy[y][currentX] = 0;
                    arrayCopy[y + 1][currentX + options[1]] = 2;
                }
            }
        }
    }
    return arrayCopy;
}

const simulation = () => {
    arrayToWorkOn = nextStep(arrayToWorkOn);
    drawFromArray(arrayToWorkOn);
}