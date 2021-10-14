let step = Math.PI / 256;
let figure = [];
const figures = [
    [{x:100, y:100}, {x:900, y:100}, {x:900, y:900}, {x:100, y:900}],
    [{x:100, y:600}, {x:500, y:400}, {x:900, y:600}],
    [{x:100, y:700}, {x:500, y:100}, {x:900, y:700}],
    [{x:100, y:700}, {x:500, y:7}, {x:900, y:700}]
];
let startPoint = {
  x: 500,
  y: 500,
};
let tablesData = [];
let stopAngle;
let isFigureDrawing = false;
let candle;
let ctx = document.getElementById('illustration').getContext('2d');
let angleData = [];
let mainTablesData;
let choosingStartPoint = false;
let Deep;

google.charts.load('current', {'packages':['corechart']});

let drawDiagram = () => {
    //reformat angles
    let anData = [['x', 'y']]
    angleData.forEach((item, i) => {
        item.forEach((it, j) => {
            if (it == 1) {
                anData.push([j, i]);
            }
        });
    });
    console.log(anData);

   let data = google.visualization.arrayToDataTable(anData);

    let options = {
        pointSize: 5,
        title: 'углы падения',
        hAxis: {title: 'углы падения', minValue: 0, maxValue: 15},
        vAxis: {title: 'начальные углы', minValue: 0, maxValue: 15},
        legend: 'none'
    };

    let chart = new google.visualization.ScatterChart(document.getElementById('chart'));

    chart.draw(data, options);

}

let prepareMainTable = () => {
    let dots = candle.dots;
   for (let index = 0; index < mainTablesData.length; index++) {
       mainTablesData[index] =  new Array(Math.floor(Math.sqrt(Math.pow(dots[index].x - dots[(index + 1) % dots.length].x, 2)
           + Math.pow(dots[index].y - dots[(index + 1) % dots.length].y, 2))) + 3);
       for (let i = 0; i < mainTablesData[index].length; i++){
           mainTablesData[index][i] = [`${i + 1}`, 0];
       }
   }
};

let drawChart = () => {
    tablesData = [];

    let candleData = candle.data;
    let dots = candle.dots;
    candleData.forEach((oneSideData, index, array) => {

        let tableDataRow = new Array(Math.floor(Math.sqrt(Math.pow(dots[index].x - dots[(index + 1) % dots.length].x, 2)
            + Math.pow(dots[index].y - dots[(index + 1) % dots.length].y, 2))) + 3);
        for (let i = 0; i < tableDataRow.length; i++) tableDataRow[i] = ['', 0];


        oneSideData.forEach((coords, i, ar) => {
            tableDataRow[Math.floor(coords) + 1][1]++;
        });
        for (let i = 0; i < tableDataRow.length; i++){
            tableDataRow[i][0] = `${i}`;
        }
        tableDataRow[0] = ['x', 'y'];
        tablesData.push(tableDataRow);

    });
    for(let i = 0; i < tablesData.length; i++){
        for (let j = 0; j < tablesData[i].length ; j++){

            mainTablesData[i][j][1] += tablesData[i][j][1];

        }
        mainTablesData[i][0][0] = 'x';
        mainTablesData[i][0][1] = 'y';
    }
    //google.charts.setOnLoadCallback(drawVisualization);
    if (candle.candle.angle < stopAngle) candle.turnRay(step, Deep, drawChart);
    else{
        angleData = candle.angls;
        google.charts.setOnLoadCallback(drawDiagram);
    }
};

let preDrawing = () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1000, 1000);
    console.log(figure);
    ctx.strokeStyle = '#352758';
    ctx.beginPath();
    ctx.arc(figure[0].x, figure[0].y, 4, 0, 2 * Math.PI);
    ctx.stroke();
    for (let i = 1; i < figure.length; i++){
        ctx.beginPath();
        ctx.moveTo(figure[i - 1].x, figure[i - 1].y);
        ctx.lineTo(figure[i].x, figure[i].y);
        ctx.arc(figure[i].x, figure[i].y, 4, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(figure[figure.length - 1].x, figure[figure.length - 1].y);
    ctx.lineTo(figure[0].x, figure[0].y);
    ctx.stroke();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 4, 0, 2 * Math.PI);
    ctx.fill();
}

let startRender = () => {
    stopAngle = Math.PI * 2 + +(startRayAngle.value);
    step = Math.PI / ((+(rays.value) - 1) / 2);
    candle = new Candle(startPoint.x, startPoint.y, +(startRayAngle.value), figure);
    candle.createCanvas();
    candle.drawFigure();
    candle.renderFigure();
    prepareMainTable();
    Deep = +(deepOfSearching.value)
    candle.drawNext(Deep, drawChart);
}

renderF.onclick = function (){
    mainTablesData =  new Array(figure.length);
    isFigureDrawing = false;

    startRender();
}

drawF.onclick = function (){
    isFigureDrawing = true;
    figure = [];
}

Delete.onclick = function () {
    figure.pop();
    preDrawing();
}

preset.onclick = function (){
    figure = figures[preset.selectedIndex];
    preDrawing();
}

reset.onclick = function () {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1000, 1000);
    angleData = [];
    figure = [];
    tablesData = [];
    candle = {};
    mainTablesData = [];
    isFigureDrawing = false;
    startPoint = {
        x: 500,
        y: 500,
    };
    choosingStartPoint = false;
}

illustration.onclick = function (event){
    if (choosingStartPoint){
        isFigureDrawing = false;
        startPoint.x = event.x;
        startPoint.y = event.y;
        choosingStartPoint = false;
        preDrawing();
    }
    if (isFigureDrawing){
        figure.push({x: event.x,y: event.y});
        preDrawing();
    }
}

laser.onclick = function (){
    choosingStartPoint = true;
}
