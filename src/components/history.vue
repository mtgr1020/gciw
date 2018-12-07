<template>
  <div class="main-wrap">
    <section class="sidebar">
      <div class="title">
        <h1>Historical Visitor Flow</h1>
      </div>
      <div class="guest">
        <p class="headline">
          <i></i>
          Total Number of VIsitors
        </p>
        <numberCount :value="his_nextGuestNum"></numberCount>
      </div>
      <div class="broken-line" ref="broken">

      </div>
      <div class="hot-area">
        <div>
          <p class="headline">
            <i></i>
            Hottest Areas <span>({{ hotareaDate }})</span>
          </p>
        </div>
        <div ref="hotRows">
          <div class="hot-row" v-for="(value, key) in his_hotarea" :key="key">
            <table>
              <tr v-for="item in value" :key="item.name" style="height: 60px">
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

      </div>
      <div class="best-product">
        <div>
          <p class="headline">
            <i></i>
            Best Products<span> ({{ bestproductDate }})</span>
          </p>
        </div>
        <div ref="bestRows">
          <div class="hot-row" v-for="(value, key) in his_bestproduct" :key="key">
            <div>
              <table>
                <tr v-for="item in value" :key="item.name" style="height: 60px">
                  <td>
                    <div  style="overflow: hidden; width: 200px;white-space:nowrap;margin-right: 15px;">
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
      <div class="explain">

      </div>
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
  import flickity from 'flickity'
  import clock from '../assets/js/clock'
  import broken from '../assets/js/broken'
  import h337 from 'heatmap.js'
  import numberCount from './numberCount'

  export default {
    data() {
      return {
        name: 'history',
        his_hotarea: {},
        hotFlickFlag: false,
        his_bestproduct: {},
        bestFlickFlag: false,
        hotareaDate: '',
        bestproductDate: '',
        momentDate: '',
        his_socket: undefined,
        his_guestNum: 0,
        his_nextGuestNum: 0,
        his_brokenData: {},
        brokenInstance: undefined,
        configMap: {
          radius: 40,
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
          workstation: {x: 0.172, y: 0.412, rx: 0.057, ry: 0.25, q: 'upperHalf', f: 0.16},//x x坐标，rx 热力绘制x坐标，q 上下区，f 随机热力浮动范围
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
        hisTotalData: {},
        scrollInterArray: [],
        his_socket2: [],
      }
    },
    computed: {},
    mounted() {
      clock.create({
        container: this.$refs.pg_clock
      });
      this.initBroken();
      this.getMomentDate();
      this.$nextTick(this.renderAreaGather(), this.initMap(), this.his_initSocket());
      let _this = this;
      window.addEventListener('unload', function () {
        _this.his_destory();
      });
      window.addEventListener('beforeunload', function () {
        _this.his_destory();
      });
      setInterval(() => {
        // _this.his_socket.send("{'update_history_map':'" + JSON.stringify(_this.hisTotalData) + "'}");//来宾
        _this.his_socket2.send(JSON.stringify(_this.hisTotalData));//来宾
      }, 3000);
    },
    methods: {
      getMomentDate: function(){
        let nowDate = new Date();
        this.momentDate = (nowDate.getMonth()+1)+'.'+ (nowDate.getDate()<10?'0'+nowDate.getDate():nowDate.getDate())+'.'+ nowDate.getFullYear();
      },
      initMap: function () {
        this.configMap.container = this.$refs.heatmap;
        this.heatmapInstance = h337.create(this.configMap);
      },
      updateMap: function (data) {
        data = data || [];
        if (data.length === 0) {
          return false
        }
        for (let i = 0; i < data.length; i++) {
          let coordinates = JSON.parse(data[i].coordinates);
          for (let l = 0; l < coordinates.length; l++) {
            let _x = parseFloat(coordinates[l][0].toFixed(2));
            // _x = _x - parseFloat((_x * 100 % 5 / 100).toFixed(2));
            _x = Subtr(_x, parseFloat((_x * 100 % 5 / 100).toFixed(2)));
            let _y = parseFloat(coordinates[l][1].toFixed(2));
            // _y = _y - parseFloat((_y * 100 % 5 / 100).toFixed(2));
            _y = Subtr(_y,parseFloat((_y * 100 % 5 / 100).toFixed(2)));
            this.hisTotalData[data[i].name + "|" + _x + "," + _y] ? (this.hisTotalData[data[i].name + "|" + _x + "," + _y] += 1) : (this.hisTotalData[data[i].name + "|" + _x + "," + _y] = 1);
          }
        }
        this.setInstanceData();

        function Subtr(arg1,arg2){
          var r1,r2,m,n;
          try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
          try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
          m=Math.pow(10,Math.max(r1,r2));
          n=(r1>=r2)?r1:r2;
          return ((arg1*m-arg2*m)/m).toFixed(n);
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
          let drawArea = formatData(_this.hisTotalData);
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
          let formatHisdata = {};
          let formatArray = [];
          for(let key in data){
            let areaNumber = data[key];
            let areaName = key.split("|")[0];
            formatHisdata[areaName] = formatHisdata[areaName]?formatHisdata[areaName]+areaNumber:areaNumber;
          }
          for(let key in formatHisdata){
            formatArray.push({
              Exa_name: key,
              number: formatHisdata[key]
            })
          }
          formatArray.forEach((item, index) => {
            matArray.push(item.number);
          });
          matArray = matArray.sort((a, b) => b - a).splice(0, 3);
          formatArray.forEach((item, index) => {
            if (matArray.includes(item.number)) {
              reArray.push(item.Exa_name.toLowerCase());
            }
          });
          return reArray;
        }
      },
      setInstanceData: function () {
        let ttdata = this.hisTotalData;
        let points = []; //热力绘制点集合
        let max = 0;
        let radius = this.configMap.radius;//热力原点半径
        let _cn = this.fireObject;  //存储绘制区域的坐标点
        let yfloat = 0.1;//y 轴方向上的浮动值
        for (let key in ttdata) {
          let dar = _cn[key.split("|")[0]];//去绘制对象的坐标实例
          let x = key.split("|")[1].split(",")[0];
          let y = key.split("|")[1].split(",")[1];
          let px = Math.floor((dar.rx + dar.f * x) * this.fireObject.w);
          let py = Math.floor((dar.ry + yfloat * (dar.q==='upperHalf'?(1 - y):y)) * this.fireObject.h);
          max = Math.max(max, ttdata[key]);//取最大值
          let point = {
            x: px,
            y: py,
            value: ttdata[key],
            radius: dar.f / 20 * this.fireObject.w
          };
          points.push(point);
        }
        this.heatmapInstance.setData({
          max: max,
          data: points
        });
        this.drawFire();
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
      initBroken: function () {
        this.brokenInstance = broken.create({
          container: this.$refs.broken
        });
        this.renderBroken();
      },
      renderBroken: function () {
        this.brokenInstance.setData(this.his_brokenData);

      },
      setHotFlickity() {
        let _this = this;
        let rows = this.$refs.hotRows;
        let rowsLen = rows.children.length;
        let flkty = new flickity(rows, {
          selectedAttraction: 0.05,//滑块的速度
          friction: 0.9,//滑块的振幅
          cellAlign: 'center',//位置
          pageDots: false,//小原点
          wrapAround: true,//是否环绕
          prevNextButtons: false,
          autoPlay: 5000
        });
        flkty.lastIndex = 0;
        const dateArray = ['12.11.2018','12.12.2018','12.13.2018','12.14.2018','12.15.2018'];
        if(_this.hotareaDate === ''){
          _this.hotareaDate =  dateArray[0] == _this.momentDate?'Today':dateArray[0];
        }
        flkty.off('change');
        flkty.on( 'change', function( index ) {
          if(index === (rowsLen-1)){
            _this.hotareaDate = 'Total';
          }else{
            _this.hotareaDate = dateArray[index] == _this.momentDate?'Today':dateArray[index];
          }
        });
      },
      setBestFlickity() {
        let _this = this;
        let rows = this.$refs.bestRows;
        let rowsLen = rows.children.length;
        console.log("len"+rowsLen);
        let flkty = new flickity(rows, {
          selectedAttraction: 0.05,//滑块的速度
          friction: 0.9,//滑块的振幅
          cellAlign: 'center',//位置
          pageDots: false,//小原点
          wrapAround: true,//是否环绕
          prevNextButtons: false,
          autoPlay: 5000
        });
        _this.checkScroll();
        flkty.lastIndex = 0;
        const dateArray = ['12.11.2018','12.12.2018','12.13.2018','12.14.2018','12.15.2018'];
        if(_this.bestproductDate === ''){
          _this.bestproductDate = dateArray[0] == _this.momentDate?'Today':dateArray[0];
        }

        flkty.on( 'change', function( index ) {
          console.log(index);
          if(index === (rowsLen-1)){
            _this.bestproductDate = 'Total';
          }else{
            _this.bestproductDate = dateArray[index] == _this.momentDate?'Today':dateArray[index];
          }
        });
      },
      checkScroll: function () {
        const speed = 40;
        for(let i=0;i<this.scrollInterArray.length;i++){
          clearInterval(this.scrollInterArray[i]);
        }
        this.scrollInterArray = [];
        let bestDivCh = this.$refs.bestRows.firstChild.firstChild.children;
        for(let j=0;j<bestDivCh.length;j++){
          let bestTbCh = bestDivCh[j].firstChild.firstChild.children;
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
        }


        function MarqueeAdd(el,el1,el2) {
          if(el2.offsetWidth - el.scrollLeft <= 0) {
            el.scrollLeft = el.scrollLeft - el1.offsetWidth;
          } else {
            el.scrollLeft++;
          }
        }

      },
      his_initSocket() {
        this.his_socket2 = new WebSocket('ws://10.110.131.251:8002/'); //History_booth_heat
        this.his_socket = new WebSocket('ws://10.110.131.251:9003/'); //History_booth_heat
        this.his_socket.onmessage = this.his_onMessage;
        this.his_socket.onclose = this.his_onClose;
        this.his_socket.onopen = this.his_onOpen;

      },
      his_destory() {
        sessionStorage.setItem('disconnect', new Date().getSeconds());//测试是否发送了断开信号
        this.his_socket.send('disconnect');
        this.his_socket.close();
      },
      his_onMessage(ev) {
        let _this = this;
        let response = eval('(' + ev.data + ')');
        let key = Object.keys(response)[0];
        switch (key) {
          case 'Total_numbers':
            _this.his_nextGuestNum = response['Total_numbers'];
            break;
          case 'History_booth_heat':
            let boothData = response['History_booth_heat'];
            let obj = {};
            for (let i = 0, l = boothData.length; i < l; i++) {
              if (!obj[boothData[i].date]) {
                obj[boothData[i].date] = [];
              }
              obj[boothData[i].date].push(boothData[i])
            }
            _this.his_hotarea = obj;

            if(!_this.hotFlickFlag){
              _this.hotFlickFlag = true;
              _this.$nextTick(_this.setHotFlickity);
            }
            break;
          case 'Thumb_up_total':
            let thumbData = response['Thumb_up_total'];
            let thumbObj = {};
            for (let i = 0, l = thumbData.length; i < l; i++) {
              if (!thumbObj[thumbData[i].date]) {
                thumbObj[thumbData[i].date] = [];
              }
              thumbObj[thumbData[i].date].push(thumbData[i])
            }
            _this.his_bestproduct = thumbObj;
            if(!_this.bestFlickFlag){
              _this.bestFlickFlag = true;
              _this.$nextTick(_this.setBestFlickity);
            }
            break;
          case 'history_numbers':
            _this.his_brokenData = response['history_numbers'];
            this.renderBroken();
            break;
          case 'select_history_map':
            _this.hisTotalData = response['select_history_map'].replace("null", "") || {};
            if (typeof _this.hisTotalData === "string") {
              _this.hisTotalData = JSON.parse(_this.hisTotalData);
            }
            break;
          case 'History_heat_map':
            let hmd = _this.heatmapData = response['History_heat_map'];
            let umd = [];
            for (let i = 0; i < hmd.length; i++) {
              umd.push({name: hmd[i].Exa_name.toLowerCase(), number: hmd[i].number, coordinates: hmd[i].coordinates});
            }
            _this.updateMap(umd);
            break;
          default:
        }
      },
      his_onOpen() {
        this.his_socket.send('select_history_map');//来宾
        setTimeout(() => {
          this.his_socket.send('History_booth_heat');//最热
        }, 10);
        setTimeout(() => {
          this.his_socket.send('Thumb_up_total');//最热
        }, 30);
        setTimeout(() => {
          this.his_socket.send('People_counting');//最热
        }, 50);
        setTimeout(() => {
          this.his_socket.send('History_heat_map');//最热
        }, 80);
        setTimeout(() => {
          this.his_socket.send('Total_numbers');//来宾
        }, 100);
      },
      his_onClose() {
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
    overflow: hidden;
    display: flex;
    color: #fff;
    background-image: url("../assets/img/mapbg.png");
    background-size: 100% 100%;
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
      }
      .broken-line {
        width: 350px;
        height: 150px;
        margin-top: 171px;
      }
      .hot-area {
        width: 360px;
        height: 260px;
        margin-top: 60px;
        border-bottom: rgba(255, 255, 255, 0.15) 1px solid;
        overflow: hidden;
        .hot-row {
          width: 360px;
        }
        p i {
          background-image: url("../assets/img/icon_fire.png");
        }
      }
      .best-product {
        width: 360px;
        height: 260px;
        margin-top: 40px;
        padding: 0 0 40px;
        overflow: hidden;
        .hot-row {
          width: 360px;
        }
        p i {
          background-image: url("../assets/img/icon_praise.png");
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
      span{
        font-size: 20px;
      }
    }

  }

</style>
