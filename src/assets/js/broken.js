;(function (name, context, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory)
  } else {
    context[name] = factory();
  }
})('broken', this, function () {

  const brokenConfig = {};

  const Util = {
    merge: function () {
      var merged = {};
      var argsLen = arguments.length;
      for (let i = 0; i < argsLen; i++) {
        const obj = arguments[i]
        for (let key in obj) {
          merged[key] = obj[key];
        }
      }
      return merged;
    },
    CreateBezierPoints: function (anchorpoints, pointsAmount) {
      var points = [];
      for (var i = 0; i < pointsAmount; i++) {
        var point = Util.MultiPointBezier(anchorpoints, i / pointsAmount);
        points.push(point);
      }
      return points;
    },
    MultiPointBezier: function (points, t) {
      var len = points.length;
      var x = 0, y = 0;
      var erxiangshi = function (start, end) {
        var cs = 1, bcs = 1;
        while (end > 0) {
          cs *= start;
          bcs *= end;
          start--;
          end--;
        }
        return (cs / bcs);
      };
      for (var i = 0; i < len; i++) {
        var point = points[i];
        x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
        y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
      }
      return {x: x, y: y};
    }
  };

  const Canvas2dRenderer = (function Canvas2dRendererClosure() {

    const coordinateConfig = ['12.11', '12.12', '12.13', '12.14', '12.15'];

    function Canvas2dRenderer(config) {
      let container = config.container;
      let canvas = this.canvas = config.canvas || document.createElement('canvas');

      const computed = getComputedStyle(config.container) || {};
      this._width = canvas.width = config.width || +(computed.width.replace(/px/, ''));
      this._height = canvas.height = config.height || +(computed.height.replace(/px/, ''));

      this.ctx = canvas.getContext('2d');
      this.ctx.strokeStyle = "white";
      this.ctx.fillStyle = "white";
      this.ctx.lineJoin = "round";
      canvas.style.cssText = 'position:absolute;left:0;top:0;';


      container.style.position = 'relative';
      container.appendChild(canvas);
    }

    Canvas2dRenderer.prototype.coordinate = function (xdata) {
      this.ctx.clearRect(0, 0, this._width, this._height);
      const data = this.coorConfig = xdata || coordinateConfig; //动态获取数据 保留场景传入 这样保证渲染的日期可不是固定的
      const ctx = this.ctx;
      const textX = 10;//文本X轴的偏移量
      const textY = 30;
      const fontsize = 18;//字体的大小

      let cx = this._width;//通过偏移量 计算辅助横线的长度
      let cy = this._height - textY - fontsize;
      ctx.strokeStyle = "rgba(239, 223, 216, 0.3)";
      ctx.lineWidth = 1;
      for (let i = 0, len = 4; i < len; i++) {
        ctx.beginPath();
        ctx.moveTo(0, cy - (30 * i));
        ctx.lineTo(cx, cy - (30 * i));
        ctx.stroke();
      }

      ctx.font = fontsize + "px PingFangSC-Regular";
      ctx.fillStyle = "#A1ABC1";
      let space = (this._width + textX) / data.length;//计算字体间距
      for (let i = 0, len = data.length; i < len; i++) {
        ctx.fillText(data[i], textX + (i * space), this._height - fontsize);
      }
    };

    Canvas2dRenderer.prototype.drawBroken = function (data) {
      const ctx = this.ctx;
      const excursion = 38;//偏移量
      ctx.lineWidth = 3;
      let max = 0; //通过最大值 计算高度比列 保证数据过大不会溢出
      let min = Number.MAX_VALUE;
      let countPoint = [];//保存整理后的数据
      let updownNum = 0;//贝赛尔曲线弯度方向
      let guijipoints = [];
      for (let key in data) {
        max = Math.max(max, data[key]);
        min = Math.min(min, data[key]);
        countPoint.push(data[key]);
      }
      for (let a = 0; a < coordinateConfig.length; a++) {
        countPoint[a] || (countPoint.push(0))
      }
      let space = (this._width) / countPoint.length;//计算字体间距
      const ratio = (this._height * 0.4) / max;//最大值 保持在中线的位置
      let mid = Math.floor((max + min) / 2 * ratio) + 15;
      //直接从第二个点开始绘制 第一个点的进场线先不添加
      for (let i = 1; i < countPoint.length; i++) {
        if (countPoint[i] === 0) {
          continue;
        }
        let ratioY0 = 2 * mid - Math.floor(countPoint[i - 1] * ratio);
        let ratioY1 = 2 * mid - Math.floor(countPoint[i] * ratio);
        ctx.strokeStyle = "#64C7A6";
        if (i === 1) {
          ctx.beginPath();
          ctx.moveTo(0, ratioY0 - 15);
          guijipoints.push({
            x: 0,
            y: ratioY0 - 15
          });
          ctx.quadraticCurveTo(10, ratioY0 - 5, i * space - excursion, ratioY0);
          guijipoints.push({
            x: excursion + 10,
            y: ratioY0 - 5
          });
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(i * space - excursion, ratioY0);
        guijipoints.push({
          x: i * space - excursion,
          y: ratioY0
        });
        // ctx.lineTo((i+1)*56-excursion,Math.floor(countPoint[i]*ratio));
        if (ratioY0 < ratioY1) {
          updownNum = 2;
        } else {
          updownNum = -2;
        }
        ctx.quadraticCurveTo(i * space - excursion + 27, (ratioY0 + ratioY1) / 2 + updownNum, (i + 1) * space - excursion, ratioY1);
        guijipoints.push({
          x: i * space - excursion + 27,
          y: (ratioY0 + ratioY1) / 2 + updownNum
        });
        guijipoints.push({
          x: (i + 1) * space - excursion,
          y: ratioY1
        });
        ctx.stroke();

        //获取贝塞尔曲线上的轨迹
        let wdb = Util.CreateBezierPoints(guijipoints,100);
        let x0,y0;
        for(let o=0;o<wdb.length;o++){
          var x = wdb[o].x,y=wdb[o].y+2;
          var linear = ctx.createLinearGradient(x,y,x,110);
          linear.addColorStop(0,"rgba(100,199,166,0.05)");
          linear.addColorStop(1,"rgba(100,199,166,0)");
          ctx.strokeStyle= linear;

          ctx.beginPath();
          ctx.moveTo(x,y);
          ctx.lineTo(x,110);
          ctx.stroke();

          // ctx.strokeStyle = "#64C7A6";
          // ctx.beginPath();
          // ctx.moveTo(x,y);
          // ctx.lineTo(x+1,y);
          // ctx.stroke();
        }
        guijipoints = [];
        this.ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(i * space - excursion, ratioY0, 4, 0, 2 * Math.PI);
        ctx.stroke();
        this.ctx.strokeStyle = "#64C7A6";
        ctx.beginPath();
        ctx.arc(i * space - excursion, ratioY0, 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(countPoint[i - 1], i * space - excursion-10, ratioY0 - 14);
      }

      //这个为了找出0的 默认不是最后一点 其实这个会有个bug 就是真为0的时候就比较扯了 那也就是我现在做的不能跳日期
      for (let i = 4; i > -1; i--) {
        if (countPoint[i] > 0) {
          this.curPoint(countPoint[i], (i + 1) * space - excursion, 2 * mid - Math.floor(countPoint[i] * ratio));
          break;
        }
      }


    };
    /**
     * 单独拉出来是为了可以比如最后一个点有特许的渲染需求的时候
     * @param text
     * @param x
     * @param y
     */
    Canvas2dRenderer.prototype.curPoint = function (text, x, y) {
      const ctx = this.ctx;
      ctx.stroke();
      this.ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.stroke();
      this.ctx.strokeStyle = "#64C7A6";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillText(text, x -15, y - 18);
    };

    Canvas2dRenderer.prototype.renderData = function (data) {
      this.coordinate();
      this.drawBroken(data);
    };


    return Canvas2dRenderer;
  })();

  const Broken = (function brokenClosure() {
    function Broken() {
      let config = this._config = Util.merge(brokenConfig, arguments[0] || {});
      this._renderer = new Canvas2dRenderer(config);
    }

    Broken.prototype = {
      setData: function (data) {
        this._renderer.renderData(data);
      }
    };
    return Broken;
  })();

  const brokenFactory = {
    create: function (config) {
      return new Broken(config);
    }
  };

  return brokenFactory;
});
