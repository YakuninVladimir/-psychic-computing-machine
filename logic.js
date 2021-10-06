class Candle {
    constructor(X, Y, angle, figure) {
        this.angls = [];
        this.rayInAngle = false;
        this.width = 1000;
        this.height = 1000;
        this.dots = figure;
        this.candle = {
            x: X,
            y: Y,
            angle: angle,
        };
        this.currentLine = this.countStartRay();
        this.lines = [];
        this.data = [];
        this.isVirgin = true;
    }

    turnRay(ang, deep, callback) {
        this.isVirgin = true;
        this.candle.angle += ang;
        this.currentLine = this.countStartRay();
        this.data = [];
        this.lines = [];
        this.renderFigure();
        this.rayInAngle = false;
        this.drawNext(deep, callback);

    }

    countStartRay () {
        const len = 10;
        let x1 = this.candle.x,
            x2 = this.candle.x + len * Math.cos(this.candle.angle),
            y2 = this.candle.y + len * Math.sin(this.candle.angle),
            y1 = this.candle.y;
        return {
            x: this.candle.x,
            y: this.candle.y,
            A: y1 - y2,
            B: x2 - x1,
            C: x1 * y2 - x2 * y1,
        }
    }

    det (a, b, c, d) {
        return a * d - b * c;
    }

    createCanvas () {
        this.canvas = document.getElementById('illustration');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
    }

    drawFigure() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = 'darkred';
        this.ctx.beginPath();
        this.ctx.moveTo(this.dots[0]?.x, this.dots[0]?.y);
        this.dots.forEach((item, index, array) => {
            this.ctx.lineTo(this.dots[(index + 1) % array.length]?.x, this.dots[(index + 1) % array.length]?.y);
        });
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(this.candle.x, this.candle.y, 4, 0, Math.PI * 2, false);
        this.ctx.stroke();
    }

    drawCurrentAngle () {
        const len = 10;
        this.ctx.strokeStyle = 'green';
        this.ctx.beginPath();
        this.ctx.moveTo(this.candle.x, this.candle.y);
        this.ctx.lineTo(this.candle.x + len * Math.cos(this.candle.angle), this.candle.y + len * Math.sin(this.candle.angle));
        this.ctx.stroke();
    }

    renderFigure () {
        let dots = this.dots;
        this.dots.forEach((item, i, array) => {
            this.data.push({side: i, array : []});
            let x1 = dots[i].x,
                x2 = dots[(i + 1) % array.length].x,
                y1 = dots[i].y,
                y2 = dots[(i + 1) % array.length].y;
            this.lines.push({
                A: y1 - y2,
                B: x2 - x1,
                C: x1 * y2 - x2 * y1,
                border: {
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                }
            });
        });

        //подготовка массива углов
        for (let i = 0; i <= 360; i++) {
            let Line = [];
            for (let j = 0; j <= 360; j++) {
                Line.push(0);
            }
            this.angls.push(Line);
        }
    }

    intersect (lineA, lineB) {
        let zn = this.det (lineA.A, lineA.B, lineB.A, lineB.B);
        if (Math.abs (zn) < 1e-9) return false;
        let res = {}
        res.x = - this.det (lineA.C, lineA.B, lineB.C, lineB.B) / zn;
        res.y = - this.det (lineA.A, lineA.C, lineB.A, lineB.C) / zn;
        return res;
    }

    countNewDirection (crossingPoint) {
        if (!crossingPoint.isExists) return false;
        //находим нормаль к стороне
        let N = {
            A: -crossingPoint.line.B,
            B: crossingPoint.line.A,
            C: crossingPoint.line.C + 1,
        };
        //определяем точки пересечения нормали со стороной и исходной прямой
        let sideCross = this.intersect(N, crossingPoint.line);
        let mainRayCross = this.intersect(N, this.currentLine);

        if (mainRayCross) {

            //найдём угол падения
            let incidenceAngleCos = (crossingPoint.line.A * this.currentLine.A + crossingPoint.line.B * this.currentLine.B) /
                Math.sqrt((crossingPoint.line.A * crossingPoint.line.A + this.currentLine.A *this.currentLine.A) * (crossingPoint.line.B * crossingPoint.line.B + this.currentLine.B *this.currentLine.B));

            let newRayPoint = {
                x: 2 * sideCross.x - mainRayCross.x,
                y: 2 * sideCross.y - mainRayCross.y,
            }

            //находим уравнение новой прямой
            let x1 = newRayPoint.x,
                x2 = crossingPoint.x,
                y1 = newRayPoint.y,
                y2 = crossingPoint.y;

            this.angls[Math.round(180/Math.PI * this.candle.angle)][Math.round(180/Math.PI * Math.acos(Math.abs(incidenceAngleCos)))] = 1;

            return {
                x: crossingPoint.x,
                y: crossingPoint.y,
                A: y1 - y2,
                B: x2 - x1,
                C: x1 * y2 - x2 * y1,
            }
        }
        else {
            this.angls[Math.round(180/Math.PI * this.candle.angle)][90] = 1;
            return {
                x: crossingPoint.x,
                y: crossingPoint.y,
                A: this.currentLine.A,
                B: this.currentLine.B,
                C: this.currentLine.C,
            }
        }
    }

    drawNext (deep, callback) {
        //preparing
        this.drawFigure();
        this.drawCurrentAngle();
        let crossingPoint = {isExists: false};

        //checking all lines of figure
        this.lines.forEach((item, i, array) => {

            //finding denominator

            let zn = this.det (item.A, item.B, this.currentLine.A, this.currentLine.B);
            let res = {};

            //checking if current and previous points are not the same
            if (Math.abs(item.A * this.currentLine.x + item.B * this.currentLine.y + item.C)  >  0.001
            && Math.abs(zn) >= 1e-9) {


                //finding coordinates of intersection point
                res.x = -1 * this.det (item.C, item.B, this.currentLine.C, this.currentLine.B) / zn;
                res.y = -1 * this.det (item.A, item.C, this.currentLine.A, this.currentLine.C) / zn;


                //checking if new pin is in our figure
                if (Math.max(item.border.x1,item.border.x2)  + 0.01>= Math.round(res.x) && Math.round(res.x)  >= Math.min(item.border.x1,item.border.x2 - 0.01)
                    && Math.max(item.border.y1,item.border.y2) + 0.01>= Math.round(res.y)  && Math.round(res.y)  >= Math.min(item.border.y1,item.border.y2) - 0.01){

                    //collecting data


                    //updating intersection point data
                    if (!this.isVirgin || ( (res.y - this.candle.y) * Math.sin(this.candle.angle) >= 0 &&
                            (res.x - this.candle.x) * Math.cos(this.candle.angle) >= 0 )) {

                        crossingPoint.x = res.x;
                        crossingPoint.y = res.y;
                        crossingPoint.line = item;
                        crossingPoint.isExists = true;

                        this.data.forEach((item, index , array) => {
                            if (item.side == i) {
                                item.array.push({x : res.x ,y : res.y});
                            }
                        });

                    }
                }

            }
        });

        this.isVirgin = false;

        //checking new point is not at angle
        this.dots.forEach((item, i , array) => {
            if (Math.abs(crossingPoint.x - item.x) < 1e-9 && Math.abs(crossingPoint.y - item.y) < 1e-9) {
                crossingPoint.isExists = false;
                this.rayInAngle = true;
            }
        });

        //drawing new line
        let newLine = this.countNewDirection(crossingPoint);
        if (newLine) {
            this.ctx.strokeStyle = 'red';
            this.ctx.beginPath();
            this.ctx.moveTo(this.currentLine.x, this.currentLine.y);
            this.ctx.lineTo(newLine.x, newLine.y);
            this.ctx.stroke();
            this.currentLine = newLine;
        }

        //next iteration
        if (deep) setTimeout(() => {this.drawNext(deep - 1, callback)}, 0);
        else {this.convertBouncingData(callback)};

    }



    convertBouncingData (chartDrawer) {
        this.data.forEach((item, index, ar) => {
            let zeroPoint = this.dots[item.side];
            let newData = [];
            item.array.forEach((coords, i, array) => {
                newData.push(Math.sqrt(Math.pow(zeroPoint.x - coords.x, 2) + Math.pow(zeroPoint.y - coords.y, 2)));
            });
            this.data[index] = newData;
        });
        chartDrawer();
    }
}