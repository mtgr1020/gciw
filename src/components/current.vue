<template>
  <div class="main-wrap">
    <section class="sidebar">
      <div class="title">
        <h1>Real-Time Visitor Flow</h1>
      </div>
      <div class="guest">
        <p class="headline">
          <i></i>
          Number of Visitors Today
        </p>
        <numberCount :value="nextGuestNum"></numberCount>

      </div>
      <div class="hot-area">
        <p class="headline">
          <i></i>
          Hottest Areas
        </p>
        <div>
          <table>
            <tr v-for="item in hotarea" :key="item.name" style="height: 60px">
              <td width="200px">{{ item.name }}</td>
              <td width="135px">
                <div style="width: 80%;padding: 0;">
                  <div :style="{ width: item.count + '%' }"
                       style="background-color: white;padding: 5px 0;border-radius: 4px;"></div>
                </div>
              </td>
              <td>{{ item.percentage }}</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="best-product">
        <div>
          <p class="headline">
            <i></i>
            Best Products
          </p>
          <div>
            <table ref="bestTb">
              <tr v-for="item in bestproduct" :key="item.name" style="height: 60px">
                <td>

                  <div  style="overflow: hidden; width: 200px;white-space:nowrap;margin-right: 15px">
                    <table>
                      <tr>
                        <td>
                          <table width="200">
                            <tr>
                              <td> {{ item.name }}</td>
                            </tr>
                          </table>
                        </td>
                        <td>
                          <table width="200">
                            <tr>
                              <td> {{ item.name }}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>

                </td>
                <td width="135px">
                  <div style="width: 80%;padding: 0;">
                    <div :style="{ width: item.count + '%' }"
                         style="background-color: white;padding: 5px 0;border-radius: 5px;"></div>
                  </div>
                </td>
                <td>{{ item.percentage }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div class="feedback">
        <div class="fe-title">
          <p class="headline">
            <i></i>
            Visitor Feedback
          </p>
        </div>
        <div class="feedback-list" ref="feedbackScroll">
          <div ref="feedbackScroll1">
            <p class="font" v-for="item in message" :key="item.id">{{ item.message }}</p>
          </div>
          <div ref="feedbackScroll2">
            <p class="font" v-for="item in message" :key="item.id">{{ item.message }}</p>
          </div>
        </div>
      </div>
    </section>
    <section class="heatmap-wrap">
      <div class="emoticon">
        <canvas style="width: 100%;height: 100%" ref="areaGather"></canvas>
      </div>
      <div class="heatmap" ref="heatmap">
      </div>
      <div class="clock-wrap">
        <h4 ref="pg_clock"></h4>
        <img src="../assets/img/PGlogo.png" style="height: 45px;margin-top: -15px"/>
        <img src="../assets/img/LenovoLogo.png"/>
      </div>

      <div class="explain"></div>
      <div class="explain-color">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </section>
  </div>
</template>

<script>

  import clock from '../assets/js/clock'
  import h337 from 'heatmap.js'
  import numberCount from './numberCount'

  export default {
    data() {
      return {
        hotarea: [],
        bestproduct: [],
        socket: undefined,
        socket2: undefined,
        message: [],
        guestNum: 0,
        nextGuestNum: 0,
        configMap: {
          radius: 20,
          maxOpacity: .7,
          minOpacity: 0,
          blur: .75,
          gradient: {
            '.4': 'rgba(86,181,218,1)',
            '.6': 'rgba(100,199,166,1)',
            '.8': 'rgba(202,191,99,1)',
            '.95': 'rgba(241,101,99,1)'
          }
        },
        addData: [],
        areaGather: {
          ud: [
            {name: 'Smart Meeting Experience', x: 0.105, y: 0.135},
            {name: 'Efficient Office Experience', x: 0.410, y: 0.135},
            {name: 'Smart Classroom Experience', x: 0.71, y: 0.135},
            {name: 'Audio/Video Enterainment', x: 0.055, y: 0.897},
            {name: 'Experience', x: 0.115, y: 0.93},
            {name: 'Smart Home Experience', x: 0.373, y: 0.907},
            {name: 'Cool Gaming Experience', x: 0.725, y: 0.907},
          ],
          cn: [
            {name: 'Workstation', x: 0.087, y: 0.43},
            {name: 'Mobile ThinkPad', x: 0.234, y: 0.43},
            {name: 'Smart Office', x: 0.437, y: 0.43},
            {name: 'Smart PC', x: 0.562, y: 0.43},
            {name: 'Commercial IOT', x: 0.674, y: 0.43},
            {name: 'School', x: 0.835, y: 0.43},
            {name: 'Smart Home', x: 0.075, y: 0.612},
            {name: 'Entertainment', x: 0.3, y: 0.612},
            {name: 'Audio/Video', x: 0.522, y: 0.612},
            {name: 'Gaming', x: 0.746, y: 0.612},
          ],
        },
        areaCtx: undefined,
        fireObject: {
          workstation: {x: 0.172, y: 0.412, rx: 0.087, ry: 0.25, q: 'upperHalf', f: 0.1},//x x坐标，rx 热力绘制x坐标，q 上下区，f 随机热力浮动范围
          mobilethinkpad: {x: 0.351, y: 0.412, rx: 0.224, ry: 0.25, q: 'upperHalf', f: 0.14},
          smartoffice: {x: 0.522, y: 0.412, rx: 0.397, ry: 0.25, q: 'upperHalf', f: 0.13},
          smartpc: {x: 0.625, y: 0.412, rx: 0.562, ry: 0.25, q: 'upperHalf', f: 0.06},
          commercialiot: {x: 0.786, y: 0.412, rx: 0.654, ry: 0.25, q: 'upperHalf', f: 0.14},
          school: {x: 0.882, y: 0.412, rx: 0.815, ry: 0.25, q: 'upperHalf', f: 0.07},
          smarthome: {x: 0.165, y: 0.594, rx: 0.075, ry: 0.682, q: 'bottomHalf', f: 0.13},
          entertainment: {x: 0.4, y: 0.594, rx: 0.23, ry: 0.682, q: 'bottomHalf', f: 0.23},
          audiovideo: {x: 0.61, y: 0.594, rx: 0.485, ry: 0.682, q: 'bottomHalf', f: 0.14},
          gaming: {x: 0.805, y: 0.594, rx: 0.666, ry: 0.682, q: 'bottomHalf', f: 0.22},
          img: null,
          w: 0,
          h: 0,
          his: []
        },
        heatmapData: [],
        cacheMapLen: [],
        scrollInterArray: []
      }
    },
    computed: {},
    mounted() {
      clock.create({
        container: this.$refs.pg_clock
      });
      this.$nextTick(this.renderAreaGather(), this.initMap(), this.initSocket());
      let _this = this;
      window.addEventListener('unload', function () {
        _this.destory();
      });
      window.addEventListener('beforeunload', function () {
        _this.destory();
      });
    },
    methods: {
      checkScroll: function () {
        const speed = 100;
        for(let i=0;i<this.scrollInterArray.length;i++){
          clearInterval(this.scrollInterArray[i]);
        }
        this.scrollInterArray = [];
        let bestTbCh = this.$refs.bestTb.children;
        for(let i=0;i<bestTbCh.length;i++){
          let scrollEl = bestTbCh[i].firstChild.firstChild;
          if(scrollEl.scrollWidth < 410){
            continue;
          }
          let scrollEl1 = scrollEl.firstChild.firstChild.children[0];
          let scrollEl2 = scrollEl.firstChild.firstChild.children[1];
          let MyMar = setInterval(MarqueeAdd, speed,scrollEl,scrollEl1,scrollEl2);
          this.scrollInterArray.push(MyMar);
        }

        function MarqueeAdd(el,el1,el2) {
          if(el2.offsetWidth - el.scrollLeft <= 0) {
            el.scrollLeft = el.scrollLeft - el1.offsetWidth;
          } else {
            el.scrollLeft++;
          }
        }

      },
      drawFire: function () {
        let _this = this;
        if (_this.fireObject.img === null) {
          let image = new Image();
          image.onload = function () {
            _this.fireObject.img = image;
            draw();
          };
          image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAlxJREFUSA21VTuIE1EUPXcm4irC7kYRP+CHLRTTWEUQC9EtVQRBLCzcall0f2G1EWGQrVZwN6azsBNsbARZKxXBwmJBEKysxA+ITrKISkxmrjdj3sx9iTtODKa5n3PuPe/d9+YF+M8/6qU/z84WEQbXAP5M5cpYltpcFhJ7ngPfv4GgWYr4hOUsdS1OJgFU/buy6nOqqaP8VPevRJ6ZnABbzUWLBlK7KjB1BzKaAVS/eIrfdnlI54SXw6o/isH8M/K87xpL34HvnwZjqy6IfKLdJsfT0ydkhG8R8DKq1VGTNzZ1B0I6boiWZR7iy5MjaLj75VY9EMzcxu0WT4KuHchVzPPM1FVmJhAXOgviuE7nweEtiU1zcflQjLcdBQo8N7cXjZ9P5VB3wc2NyOqeRH5n1e+4NeuNFkRYxfDmHfoc4h1EK27U78QNOTgm899gNbADu3kLYwyiVjurabEASqUjQjgagyHGZEQcx1mdMJjQ1ESAgzMakOUclvFusXOZomI06jY1EQixr6ucOcG7wJREs3nAoEkDwiaT7NsyD5seiQDw0ST7tkQfTA8lwCsm2ZclaoLopemRCDi5+5Ls/daYTsYyHtPiom/CWECSb+SbvGeAf7aOc13XxgJRcj2uiMgnTejNp9u0tPRc11gCtFB5J8/TKZnhV03K5tMjFAqXOrmWQAukcvkFcuuK4r3uJK8Ry7nRTeTzJ2l8vNHJsR47DUZ/IjX/ghz7RXmfDmos8om+CfYQrjsv5/eqC28n1hTQBfKE7wSaBYTONsn/gMvvsYdXaKpS17w/+b8AMkqxxUoBlLgAAAAASUVORK5CYII=";
        } else {
          draw();
        }

        function draw() {
          let drawArea = formatData(_this.heatmapData);
          _this.fireObject.his.forEach((p, index) => {
            let xy = _this.fireObject[p];
            let img = _this.fireObject.img;
            _this.areaCtx.clearRect(xy.x * _this.fireObject.w, xy.y * _this.fireObject.h, img.width, img.height);
          });
          for (let i = 0; i < drawArea.length; i++) {
            let img = _this.fireObject.img;
            let xy = _this.fireObject[drawArea[i]];
            _this.fireObject.his.push(drawArea[i]);
            _this.areaCtx.drawImage(img, xy.x * _this.fireObject.w, xy.y * _this.fireObject.h);

          }
        }

        function formatData(data) {
          let matArray = [];
          let reArray = [];
          data.forEach((item, index) => {
            matArray.push(item.number);
          });
          matArray = matArray.sort((a, b) => b - a).splice(0, 3);
          data.forEach((item, index) => {
            if (matArray.includes(item.number)) {
              if(item.number>0){
                reArray.push(item.Exa_name.toLowerCase());
              }
            }
          });
          return reArray;
        }
      },
      renderAreaGather: function () {
        let canvas = this.$refs.areaGather;
        let width = canvas.width = this.fireObject.w = this.$refs.areaGather.clientWidth || 1504;
        let height = canvas.height = this.fireObject.h = this.$refs.areaGather.clientHeight || 1080;
        let ctx = this.areaCtx = canvas.getContext('2d');
        ctx.font = "22px PingFangSC-Regular";
        ctx.fillStyle = "#8B91A4";
        this.areaGather.ud.forEach((v, index) => {
          ctx.fillText(v.name, v.x * width, v.y * height);
        });
        ctx.font = "22px ArialMT";
        ctx.fillStyle = "#FFFFFF";
        this.areaGather.cn.forEach((v, index) => {
          ctx.fillText(v.name, v.x * width, v.y * height);
        });

      },
      initMap: function () {
        this.configMap.container = this.$refs.heatmap;
        this.heatmapInstance = h337.create(this.configMap);
        // this.updateMap();
      },

      updateMap: function (data) {
        data = data || [{name: 'mobilethinkpad', number: 100, coordinates: "[[0.5625, 0.10638297872340426]]"}];
        if (data.length === 0) {
          return false
        }
        let _cn = this.fireObject;  //存储绘制区域的坐标点
        let points = []; //热力绘制点集合
        let max = 0;
        let yfloat = 0.1;//y 轴方向上的浮动值
        for (let i = 0; i < data.length; i++) {
          if(data[i].number === 0){
            continue;
          }
          let radius = this.configMap.radius;//热力原点半径
          let dar = _cn[data[i].name];//去绘制对象的坐标实例
          // let fval = dar.f / data[i].number; // 根据人数等比规划出的区域
          max = Math.max(max, data[i].number);//取最大值
          // let coordinates = eval('(' +data[i].coordinates + ')');
          let coordinates = JSON.parse(data[i].coordinates);
          for (let l = 0; l < coordinates.length; l++) {
            let x = Math.floor((dar.rx + dar.f * coordinates[l][0]) * this.fireObject.w);
            let y = Math.floor((dar.ry + yfloat * (dar.q==='upperHalf'?(1 - coordinates[l][1]):coordinates[l][1])) * this.fireObject.h);
            let point = {
              x: x,
              y: y,
              value: data[i].number,
              radius: radius
            };
            points.push(point);
          }
        }
        this.heatmapInstance.setData({
          max: max,
          data: points
        });
      },
      scrollMessage: function () {
        const speed = 100;
        let fsc = this.$refs.feedbackScroll;
        let fsc1 = this.$refs.feedbackScroll1;
        let fsc2 = this.$refs.feedbackScroll2;

        function Marquee() {
          if (fsc2.offsetTop - fsc.scrollTop <= 0) {
            fsc.scrollTop -= fsc1.offsetHeight;
          } else {
            fsc.scrollTop++
          }
        }

        if (fsc1.offsetHeight < fsc.offsetHeight) {
          fsc2.style.display = "none";
        } else {
          fsc2.style.display = "block";
          this.MyMar = setInterval(Marquee, speed)
        }

      },
      /**
       * 初始化 websocket连接
       */
      initSocket() {
        this.socket = new WebSocket('ws://10.110.131.251:9003/'); //History_booth_heat
        this.socket.onmessage = this.onMessage;
        this.socket.onclose = this.onClose;
        this.socket.onopen = this.onOpen;
        this.socket2 = new WebSocket('ws://10.110.131.251:9006/'); //History_booth_heat
        this.socket2.onmessage = this.onMessage2;
      },
      onMessage2(ev) {
        clearInterval(this.MyMar);
        this.message = eval('(' + ev.data + ')');
        this.$nextTick(this.scrollMessage);
      },
      destory() {
        this.socket.send('disconnect');
        this.socket2.send('disconnect');
      },
      onMessage(ev) {
        // console.log(ev.data);
        let _this = this;
        let response = eval('(' + ev.data + ')');
        let key = Object.keys(response)[0];
        switch (key) {
          case 'Thumb_up_today':
            _this.bestproduct = response['Thumb_up_today'];
            _this.$nextTick(_this.checkScroll());
            break;
          case 'Daily_numbers':
            _this.nextGuestNum = response['Daily_numbers'];
            break;
          case 'Daily_booth_heat':
            _this.hotarea = response['Daily_booth_heat'];
            break;
          case 'Daily_heat_map':
            // let hmd = _this.heatmapData = response['Daily_heat_map'];
            //----------- 新增 cache 5次数据----------
            let resData = response['Daily_heat_map'];
            this.cacheMapLen.push(resData.length);
            if(this.cacheMapLen.length>6){
              _this.heatmapData.splice(0,this.cacheMapLen.shift());
            }
            _this.heatmapData.push(...resData);
            let hmd =  [].concat(_this.heatmapData);
            let umd = [];
            //----------- 新增 cache 5次数据----------
            // let umd = [];
            for (let i = 0; i < hmd.length; i++) {
              umd.push({name: hmd[i].Exa_name.toLowerCase(), number: hmd[i].number, coordinates: hmd[i].coordinates});
            }
            _this.drawFire();
            _this.updateMap(umd);
            break;
          default:
        }
      },
      onOpen() {
        this.socket.send('Daily_numbers');//来宾
        setTimeout(() => {
          this.socket.send('Daily_booth_heat');//最热
        }, 10);
        setTimeout(() => {
          this.socket.send('Thumb_up_today');//最赞
        }, 30);
        setTimeout(() => {
          this.socket.send('Daily_heat_map');//热力图
        }, 50);

      },
      onClose() {
        console.log('socket is closed');
      }
    },
    components: {
      numberCount
    }
  }
</script>

<style lang="scss" scoped>
  .main-wrap {
    height: 100%;
    background-image: url("../assets/img/mapbg.png");
    background-size: 100% 100%;
    overflow: hidden;
    display: flex;
    .heatmap-wrap {
      height: 100%;
      flex: 0 1 80%;
      position: relative;
      .emoticon {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
      }
      .heatmap {
        height: 100%;
      }
      .explain {
        position: absolute;
        bottom: 24px;
        right: 21px;
        z-index: 999;
        padding: 45px 29px 53px;
        background-color: #1E1E1E;
        border-radius: 5px;
        opacity: 0.55;
        width: 265px;
      }
      .explain-color {
        display: flex;
        justify-content: space-around;
        height: 20px;
        width: 265px;
        position: absolute;
        bottom: 77px;
        right: 50px;
        z-index: 999;
        div {
          flex: 0 1 24%;
          &:nth-child(1) {
            background: #56B5DA;
            border-radius: 1px 0 0 1px;
            position: relative;
            &:before {
              content: "Sparse";
              position: absolute;
              top: 30px;
              font-family: PingFangSC-Regular;
              font-size: 21px;
              color: #F7F9FC;
            }
          }
          &:nth-child(2) {
            background: #64C7A6;
          }
          &:nth-child(3) {
            background: #CABF63;
          }
          &:nth-child(4) {
            background: #F16563;
            position: relative;
            &:after {
              content: "Intensive";
              position: absolute;
              top: 30px;
              right: 0;
              font-family: PingFangSC-Regular;
              font-size: 21px;
              color: #F7F9FC;
            }
          }
        }

      }
      .clock-wrap {
        position: absolute;
        top: 27px;
        right: 10px;
        h4 {
          display: inline-block;
          opacity: 0.8;
          font-family: ArialMT;
          font-size: 23px;
          color: #FFFFFF;
          text-align: center;
          line-height: 27px;
          font-weight: 400;
          margin-right: 30px;
          vertical-align: top;
        }

        img {
          height: 27px;
          margin-right: 20px;
        }
      }
    }
    .sidebar {
      height: 100%;
      flex: 1 1 20%;
      padding: 22px 0 0 32px;
      background-color: #323C60;
      .title {
        h1 {
          font-family: PingFangSC-Medium;
          font-size: 32px;
          color: #FBFCFD;
          line-height: 45px;
        }
      }
      .guest {
        margin-top: 52.8px;
        p i {
          background-image: url("../assets/img/icon_user.png");
        }
        .slide {
          height: 103px;
          overflow: hidden;
          margin-top: 20.7px;
          position: absolute;
          h4 {
            font-family: ArialMT;
            font-size: 90px;
            color: #FFFFFF;
            text-align: center;
            line-height: 103px;
            font-weight: 400;
          }
        }

      }
      .hot-area {
        width: 360px;
        min-height: 200px;
        margin-top: 185px;
        padding-bottom: 15px;
        border-bottom: rgba(255, 255, 255, 0.15) 1px solid;
        p i {
          background-image: url("../assets/img/icon_fire.png");
        }
      }
      .best-product {
        width: 360px;
        margin-top: 20px;
        min-height: 200px;
        padding-bottom: 15px;
        border-bottom: rgba(255, 255, 255, 0.15) 1px solid;
        p i {
          background-image: url("../assets/img/icon_praise.png");
        }
      }
      .hot-area, .best-product {
        table {
          tr {
            td:nth-child(1) {
              font-family: PingFangSC-Regular;
              font-size: 20px;
              color: #B8C3DA;
              line-height: 28px;
            }
            td:nth-child(3) {
              opacity: 0.8;
              font-family: ArialMT;
              font-size: 20px;
              color: #FFFFFF;
              text-align: left;
              line-height: 23px;
            }
          }
        }
      }

      .feedback {
        margin-top: 30px;
        padding-right: 30px;
        p i {
          background-image: url("../assets/img/icon_feedback.png");
        }
        .fe-title {
          margin-bottom: 10px;
        }

        .feedback-list {
          height: 120px;
          overflow: hidden;
          position: absolute;
          width: 352px;
          p {
            font-family: PingFangSC-Regular;
            font-size: 18px;
            color: #B8C3DA;
            line-height: 28px;
            word-break: break-word;
          }
        }
      }
    }

    .headline {
      font-family: PingFangSC-Regular;
      font-size: 24px;
      color: #F7F9FC;
      line-height: 33px;
      i {
        display: inline-block;
        width: 32px;
        height: 32px;
        transform: translateY(7px);
      }
    }
  }

</style>
