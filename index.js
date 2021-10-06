const step = Math.PI / 256;
let figure = [];
let tablesData = [];
let stopAngle = Math.PI * 2;
let isFigureDrawing = false;
let candle;
let ctx = document.getElementById('illustration').getContext('2d');
let angleData = [];
let mainTablesData;

const Deep = 5;

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
        hAxis: {title: 'Age', minValue: 0, maxValue: 15},
        vAxis: {title: 'Weight', minValue: 0, maxValue: 15},
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

let drawVisualization = () => {
    for (let i = 0; i < tablesData.length; i++){
        let wrapper = new google.visualization.ChartWrapper({
            chartType: 'AreaChart',
            dataTable: mainTablesData[i],
            options: {'title': 'numbers', curveType: 'function',},
            containerId: `main_chart_${i + 1}`
        });
        wrapper.draw();
    }
}

let drawChart = () => {
    document.querySelectorAll('.chart').forEach((chart) => {
        chart.innerHTML = '';
    });
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
        google.charts.setOnLoadCallback(drawVisualization);
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
}

let startRender = () => {
    candle = new Candle(500, 500, 0, figure);
    candle.createCanvas();
    candle.drawFigure();
    candle.renderFigure();
    prepareMainTable();
    candle.drawNext(Deep, drawChart);
}

renderF.onclick = function (){
    mainTablesData =  new Array(figure.length);
    isFigureDrawing = false;

    startRender();
}

drawF.onclick = function (){
    isFigureDrawing = true;
}

Delete.onclick = function () {
    figure.pop();
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
}

illustration.onclick = function (event){
    if (isFigureDrawing){

        figure.push({x: event.pageX,y: event.pageY});


        preDrawing();
    }
}


