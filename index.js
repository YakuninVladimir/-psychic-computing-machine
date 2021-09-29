const step = Math.PI / 1024;
let figure = [{x:100 , y:100 }, {x:900 , y:100 }, {x:900, y:900 }, {x:100, y: 900}];
let tablesData = [];
let stopAngle = Math.PI * 2;

let angleData = [];

let mainTablesData = new Array(figure.length);

const Deep = 200;

google.charts.load('current', {'packages':['corechart']});


let candle = new Candle(500, 500, 0, figure);

let drawDiagram = () => {
    let container = document.querySelector('#diagram');

    for (let i = 0; i < 360; i++){
        let way = document.createElement('div');
        way.style.height = '2px';
        way.style.width = '720px';
        for (let j = 0; j < 360; j++){
            let cell = document.createElement('div');
            cell.style.height = '2px';
            cell.style.width = '2px';
            cell.style.float = 'left';
            if (angleData[i][j]){
                cell.style.backgroundColor = 'black';
            }
            way.append(cell);
        }
        container.append(way);
    }
}

let prepareMainTable = () => {
    let dots = candle.dots;
   for (let index = 0; index < mainTablesData.length; index++) {
       mainTablesData[index] =  new Array(Math.floor(Math.sqrt(Math.pow(dots[index].x - dots[(index + 1) % dots.length].x, 2)
           + Math.pow(dots[index].y - dots[(index + 1) % dots.length].y, 2))) + 2);
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

let drawMainTable = () => {
    document.querySelectorAll('.main_chart').forEach((chart) => {
        chart.innerHTML = '';
    });
    mainTablesData.forEach((item, i, array) => {
        let wrapper = new google.visualization.ChartWrapper({
            chartType: 'AreaChart',
            dataTable: tablesData[i],
            options: {'title': 'numbers', curveType: 'function',},
            containerId: `div_${i + 1}`
        });
        wrapper.draw();
    });
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
            + Math.pow(dots[index].y - dots[(index + 1) % dots.length].y, 2))) + 2);
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
        drawDiagram();
        google.charts.setOnLoadCallback(drawVisualization);
    }
};

candle.createCanvas();
candle.drawFigure();
candle.renderFigure();

prepareMainTable();

candle.drawNext(Deep, drawChart);


