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
          radius: 30,
          maxOpacity: 0.75,
          minOpacity: 0,
          blur: .75,
          gradient: {
            '.4': 'rgba(86,181,218,1)',
            '.6': 'rgba(100,199,166,1)',
            '.8': 'rgba(202,191,99,1)',
            '.98': 'rgba(241,101,99,1)'
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
            // {name: 'Workstation', x: 0.087, y: 0.43},
            // {name: 'Mobile ThinkPad', x: 0.234, y: 0.43},
            // {name: 'Smart Office', x: 0.437, y: 0.43},
            {name: 'Smart Office', x: 0.077, y: 0.43},
            {name: 'Workstation', x: 0.264, y: 0.43},
            {name: 'Mobile ThinkPad', x: 0.407, y: 0.43},
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
          // workstation: {x: 0.172, y: 0.412, rx: 0.087, ry: 0.25, q: 'upperHalf', f: 0.1},//x x坐标，rx 热力绘制x坐标，q 上下区，f 随机热力浮动范围
          // mobilethinkpad: {x: 0.351, y: 0.412, rx: 0.224, ry: 0.25, q: 'upperHalf', f: 0.14},
          // smartoffice: {x: 0.522, y: 0.412, rx: 0.397, ry: 0.25, q: 'upperHalf', f: 0.13},
          smartoffice: {x: 0.172, y: 0.412, rx: 0.087, ry: 0.25, q: 'upperHalf', f: 0.1},//x x坐标，rx 热力绘制x坐标，q 上下区，f 随机热力浮动范围
          workstation: {x: 0.351, y: 0.412, rx: 0.224, ry: 0.25, q: 'upperHalf', f: 0.14},
          mobilethinkpad: {x: 0.532, y: 0.412, rx: 0.397, ry: 0.25, q: 'upperHalf', f: 0.13},
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
      this.$nextTick(function () {
        this.renderAreaGather();
        this.initMap();
        this.his_initSocket();
        this.his_initSocket2();
        // this.test();
      });
      let _this = this;
      window.addEventListener('unload', function () {
        _this.his_destory();
      });
      window.addEventListener('beforeunload', function () {
        _this.his_destory();
      });
      setInterval(() => {
        // _this.his_socket.send("{'update_history_map':'" + JSON.stringify(_this.hisTotalData) + "'}");//来宾
        if("{}" !== JSON.stringify(_this.hisTotalData)){
          _this.his_socket2.send(JSON.stringify(_this.hisTotalData));//来宾
        }
      }, 3000);
    },
    methods: {
      test: function(){
        let max = 0,min = 1000,sum=0,l=0;
        let tt = '{"workstation|0.20,0.55":10,"workstation|0.15,0.30":28,"mobilethinkpad|0.15,0.30":23,"mobilethinkpad|0.6,0.55":5,"smartoffice|0.85,0.30":17,"smartoffice|0.4,0.30":16,"smartpc|0.50,0.25":15,"commercialiot|0.40,0.65":14,"commercialiot|0.15,0.4":14,"commercialiot|0.60,0.40":21,"entertainment|0.90,0.30":51,"entertainment|0.85,0.30":41,"entertainment|0.75,0.30":85,"gaming|0.95,0.30":56,"gaming|0.90,0.25":33,"gaming|0.80,0.40":36,"gaming|0.50,0.40":26,"workstation|0.05,0.25":33,"workstation|0.20,0.40":11,"mobilethinkpad|0.15,0.35":36,"mobilethinkpad|0.55,0.65":1,"smartpc|0.90,0.75":3,"smartpc|0.95,0.25":25,"smartpc|0.50,0.30":19,"smarthome|0.1,0.30":13,"smarthome|0.60,0.40":7,"gaming|0.05,0.50":116,"mobilethinkpad|0.55,0.6":2,"gaming|0.95,0.25":30,"smartpc|0.15,0.30":21,"commercialiot|0.60,0.4":15,"audiovideo|0.70,0.50":11,"audiovideo|0.40,0.55":29,"mobilethinkpad|0.55,0.55":5,"commercialiot|0.35,0.45":38,"smarthome|0.10,0.25":13,"entertainment|0.05,0.45":22,"gaming|0.30,0.25":25,"gaming|0.05,0.35":114,"workstation|0.60,0.90":5,"workstation|0.80,0.65":19,"workstation|0.05,0.35":149,"commercialiot|0.95,0.4":9,"school|0.75,0.65":4,"school|0.65,0.35":30,"smarthome|0.95,0.45":8,"smarthome|0.90,0.30":78,"entertainment|0.90,0.35":146,"audiovideo|0.80,0.55":55,"workstation|0.85,0.55":11,"workstation|0.7,0.25":1,"mobilethinkpad|0.10,0.35":15,"mobilethinkpad|0.55,0.25":52,"mobilethinkpad|0.15,0.45":11,"smartoffice|0.00,0.35":22,"commercialiot|0.00,0.40":10,"commercialiot|0.40,0.4":5,"commercialiot|0.15,0.35":41,"smarthome|0.85,0.75":8,"smarthome|0.70,0.65":3,"entertainment|0.05,0.40":28,"gaming|0.8,0.7":2,"gaming|0.70,0.35":74,"gaming|0.45,0.4":14,"gaming|0.55,0.4":7,"workstation|0.85,0.50":20,"workstation|0.40,0.25":9,"smartoffice|0.90,0.30":31,"smartoffice|0.75,0.40":9,"smartpc|0.95,0.8":4,"commercialiot|0.90,0.35":61,"smarthome|0.9,0.75":12,"smarthome|0.85,0.35":38,"smarthome|0.60,0.35":13,"workstation|0.30,0.25":5,"workstation|0.00,0.35":57,"smartoffice|0.65,0.4":4,"commercialiot|0.20,0.40":24,"audiovideo|0.05,0.35":104,"gaming|0.90,0.3":11,"workstation|0.1,0.75":2,"workstation|0.55,0.30":60,"workstation|0.7,0.35":7,"mobilethinkpad|0.20,0.80":2,"mobilethinkpad|0.05,0.35":17,"mobilethinkpad|0.65,0.60":5,"smartoffice|0.60,0.40":5,"smartpc|0.90,0.30":38,"smartpc|0.05,0.60":2,"smartpc|0.95,0.75":10,"school|0.8,0.50":4,"school|0.7,0.35":14,"school|0.50,0.30":30,"smarthome|0.85,0.20":14,"smarthome|0.70,0.25":27,"gaming|0.9,0.3":8,"smartoffice|0.25,0.30":22,"smartoffice|0.60,0.25":75,"smartpc|0.2,0.55":6,"gaming|0.30,0.30":88,"gaming|0.20,0.25":28,"workstation|0.00,0.70":10,"workstation|0.25,0.5":43,"entertainment|0.15,0.45":15,"mobilethinkpad|0.60,0.60":5,"mobilethinkpad|0.50,0.30":27,"mobilethinkpad|0.55,0.50":2,"commercialiot|0.95,0.35":51,"workstation|0.80,0.40":10,"mobilethinkpad|0.30,0.3":7,"mobilethinkpad|0.55,0.70":3,"mobilethinkpad|0.55,0.30":44,"audiovideo|0.65,0.55":9,"smartoffice|0.10,0.35":27,"smartoffice|0.30,0.4":7,"gaming|0.90,0.55":18,"workstation|0.90,0.45":58,"mobilethinkpad|0.60,0.75":4,"mobilethinkpad|0.50,0.3":10,"smartoffice|0.85,0.3":2,"smartoffice|0.30,0.40":15,"smartpc|0.80,0.35":28,"smartpc|0.25,0.50":21,"audiovideo|0.45,0.35":68,"audiovideo|0.15,0.30":59,"audiovideo|0.25,0.30":55,"workstation|0.90,0.40":17,"commercialiot|0,0.35":6,"commercialiot|0.55,0.3":33,"commercialiot|0.95,0.40":16,"smarthome|0.50,0.80":24,"smarthome|0.55,0.75":52,"entertainment|0.45,0.55":3,"smartoffice|0.9,0.30":5,"smartpc|0.6,0.35":6,"smarthome|0.40,0.70":1,"smarthome|0.00,0.40":4,"smarthome|0.35,0.20":127,"entertainment|0.40,0.55":8,"audiovideo|0.15,0.35":63,"gaming|0.80,0.35":100,"workstation|0.75,0.30":21,"workstation|0.40,0.8":4,"mobilethinkpad|0.15,0.40":11,"mobilethinkpad|0.90,0.65":5,"commercialiot|0.8,0.30":22,"commercialiot|0.90,0.4":5,"entertainment|0.95,0.45":12,"workstation|0.70,0.40":13,"workstation|0.35,0.70":9,"smartpc|0.75,0.50":2,"smartpc|0.95,0.35":36,"school|0.10,0.25":29,"school|0.50,0.35":34,"entertainment|0.90,0.40":18,"entertainment|0.50,0.35":21,"entertainment|0.1,0.40":7,"smartpc|0.20,0.7":3,"smarthome|0.25,0.70":9,"smarthome|0.85,0.30":24,"smarthome|0.35,0.4":4,"entertainment|0.40,0.8":6,"entertainment|0.60,0.30":134,"audiovideo|0.90,0.30":20,"audiovideo|0.15,0.45":9,"workstation|0.05,0.30":146,"mobilethinkpad|0.60,0.25":28,"mobilethinkpad|0.80,0.75":9,"mobilethinkpad|0.90,0.35":118,"smartoffice|0.95,0.50":6,"smartoffice|0.45,0.55":93,"smartoffice|0.85,0.35":55,"smarthome|0.40,0.35":8,"smarthome|0.80,0.30":40,"entertainment|0.1,0.30":19,"gaming|0.75,0.40":55,"workstation|0.00,0.30":60,"workstation|0.15,0.25":78,"commercialiot|0.35,0.40":20,"commercialiot|0.75,0.25":37,"commercialiot|0.95,0.25":70,"smarthome|0.40,0.30":18,"entertainment|0.65,0.3":19,"entertainment|0.90,0.45":12,"smartpc|0.5,0.30":2,"smartpc|0.85,0.35":29,"smartpc|0.7,0.3":3,"entertainment|0.50,0.55":26,"entertainment|0.85,0.40":23,"entertainment|0.60,0.3":52,"entertainment|0.00,0.35":65,"entertainment|0.20,0.60":6,"mobilethinkpad|0.60,0.80":3,"mobilethinkpad|0.70,0.40":8,"smartoffice|0.95,0.55":7,"smartpc|0.65,0.30":31,"smartpc|0.35,0.30":23,"audiovideo|0.95,0.60":6,"workstation|0.30,0.45":3,"workstation|0.70,0.35":27,"smarthome|0.80,0.55":9,"smarthome|0.25,0.30":36,"entertainment|0.00,0.85":14,"gaming|0.70,0.75":10,"gaming|0.80,0.30":57,"gaming|0.85,0.40":30,"workstation|0.00,0.45":6,"workstation|0.3,0.50":5,"workstation|0.10,0.30":52,"smartoffice|0.15,0.55":13,"smartoffice|0.05,0.30":32,"smartoffice|0.90,0.55":12,"smarthome|0.75,0.40":9,"audiovideo|0.00,0.35":59,"audiovideo|0.1,0.80":4,"mobilethinkpad|0.4,0.25":12,"mobilethinkpad|0.65,0.65":4,"commercialiot|0.35,0.35":47,"gaming|0.90,0.30":81,"workstation|0.45,0.90":1,"workstation|0.1,0.3":4,"mobilethinkpad|0.95,0.50":26,"smartoffice|0.80,0.65":12,"smartoffice|0.85,0.45":11,"school|0.30,0.25":23,"school|0.80,0.25":36,"audiovideo|0.25,0.50":13,"gaming|0.25,0.80":40,"gaming|0.65,0.40":54,"gaming|0.10,0.50":73,"workstation|0.25,0.6":2,"workstation|0.80,0.35":48,"smartoffice|0.85,0.5":2,"entertainment|0.30,0.40":7,"gaming|0.85,0.45":51,"gaming|0.95,0.35":76,"gaming|0.90,0.35":140,"smartoffice|0.80,0.50":6,"smartpc|0.60,0.35":9,"smartpc|0.40,0.35":15,"smartpc|0.10,0.45":8,"audiovideo|0.45,0.6":9,"gaming|0.90,0.40":26,"workstation|0.40,0.80":2,"commercialiot|0.15,0.45":13,"commercialiot|0.20,0.35":35,"school|0.35,0.30":41,"entertainment|0.25,0.65":7,"entertainment|0.25,0.50":17,"entertainment|0.3,0.45":17,"workstation|0.35,0.30":22,"workstation|0.45,0.30":21,"smartpc|0.25,0.70":1,"smartpc|0.25,0.35":34,"smartpc|0.10,0.40":5,"commercialiot|0.95,0.20":40,"audiovideo|0.8,0.30":2,"audiovideo|0.80,0.35":30,"audiovideo|0.70,0.40":109,"workstation|0.1,0.35":21,"commercialiot|0.55,0.25":47,"commercialiot|0.7,0.30":26,"smarthome|0.20,0.25":8,"smarthome|0.10,0.35":35,"smarthome|0.45,0.30":14,"audiovideo|0.65,0.4":11,"audiovideo|0.90,0.55":8,"workstation|0.15,0.55":10,"workstation|0.00,0.4":4,"workstation|0.45,0.35":27,"entertainment|0.55,0.3":25,"entertainment|0.10,0.85":21,"entertainment|0.05,0.35":81,"audiovideo|0.20,0.4":7,"smartoffice|0.3,0.55":1,"smartoffice|0.55,0.30":34,"smartoffice|0.70,0.35":17,"smartpc|0.10,0.35":72,"workstation|0.55,0.3":4,"mobilethinkpad|0.20,0.30":28,"smartoffice|0.75,0.35":25,"smartoffice|0.55,0.25":74,"entertainment|0.05,0.4":20,"audiovideo|0.2,0.4":6,"audiovideo|0.1,0.35":16,"gaming|0.95,0.55":13,"audiovideo|0.65,0.40":14,"audiovideo|0.90,0.35":21,"gaming|0.85,0.35":100,"gaming|0.95,0.50":16,"workstation|0.85,0.4":9,"workstation|0.6,0.3":2,"mobilethinkpad|0.35,0.25":32,"smartoffice|0.05,0.55":11,"commercialiot|0.10,0.30":34,"audiovideo|0.95,0.30":118,"audiovideo|0.60,0.35":37,"workstation|0.15,0.45":10,"workstation|0.10,0.25":15,"workstation|0.35,0.60":25,"commercialiot|0.55,0.65":13,"commercialiot|0.95,0.45":5,"commercialiot|0.90,0.20":28,"gaming|0.8,0.80":8,"gaming|0.75,0.75":24,"workstation|0.30,0.75":3,"workstation|0.25,0.50":9,"smartpc|0.20,0.40":14,"smartpc|0.05,0.35":21,"school|0.4,0.50":3,"audiovideo|0.05,0.8":12,"mobilethinkpad|0.75,0.4":9,"commercialiot|0.05,0.65":6,"commercialiot|0.60,0.65":10,"commercialiot|0.90,0.60":3,"commercialiot|0.85,0.4":4,"commercialiot|0.85,0.20":43,"smarthome|0.20,0.35":17,"smarthome|0.35,0.30":15,"entertainment|0.10,0.35":150,"workstation|0.30,0.70":6,"workstation|0.35,0.6":1,"mobilethinkpad|0.40,0.30":31,"smartoffice|0.25,0.35":22,"smartpc|0.15,0.35":30,"smartpc|0.15,0.4":4,"smarthome|0.70,0.30":31,"smarthome|0.15,0.35":42,"audiovideo|0.60,0.30":23,"audiovideo|0.85,0.25":34,"audiovideo|0.05,0.70":15,"workstation|0.10,0.85":1,"workstation|0.40,0.75":5,"workstation|0.30,0.30":16,"workstation|0.10,0.35":24,"workstation|0.70,0.30":14,"smartoffice|0.05,0.35":70,"smartpc|0.10,0.30":11,"smartpc|0.30,0.40":10,"school|0.80,0.60":7,"school|0.5,0.35":6,"school|0.60,0.30":21,"entertainment|0.20,0.35":215,"audiovideo|0.05,0.7":4,"workstation|0.25,0.30":23,"workstation|0.75,0.3":10,"audiovideo|0.65,0.30":23,"workstation|0.3,0.30":3,"smartoffice|0.40,0.30":25,"smartpc|0.85,0.20":10,"smartpc|0.25,0.40":15,"smartpc|0.15,0.55":7,"audiovideo|0.35,0.70":8,"workstation|0.10,0.3":7,"commercialiot|0.40,0.35":27,"commercialiot|0.20,0.25":55,"commercialiot|0.20,0.30":43,"commercialiot|0.85,0.35":39,"audiovideo|0.65,0.3":6,"gaming|0.9,0.65":5,"gaming|0.70,0.40":35,"school|0.30,0.75":3,"school|0.50,0.25":28,"school|0.70,0.30":30,"entertainment|0.20,0.30":112,"workstation|0.40,0.35":19,"workstation|0.70,0.25":19,"mobilethinkpad|0.35,0.35":15,"mobilethinkpad|0.80,0.35":55,"commercialiot|0.75,0.35":55,"entertainment|0.50,0.30":53,"entertainment|0.70,0.35":33,"audiovideo|0.65,0.35":39,"audiovideo|0.75,0.30":25,"audiovideo|1,0.40":5,"gaming|0.90,0.70":11,"smartpc|0.25,0.4":6,"smartpc|0.7,0.35":5,"smartpc|0.15,0.5":3,"workstation|0.35,0.35":15,"mobilethinkpad|0.20,0.65":11,"entertainment|0.40,0.50":19,"entertainment|0.35,0.55":21,"audiovideo|0.35,0.35":99,"workstation|0.05,0.70":15,"workstation|0.20,0.35":19,"school|0.15,0.4":3,"school|0.35,0.40":6,"entertainment|0.00,0.55":16,"entertainment|0.1,0.60":11,"gaming|0.95,0.70":3,"workstation|0.25,0.35":20,"smartoffice|0.15,0.40":20,"smartoffice|0.7,0.25":2,"commercialiot|0.4,0.35":10,"commercialiot|0.05,0.30":53,"commercialiot|0.70,0.35":94,"commercialiot|0.80,0.55":7,"audiovideo|0.95,0.40":10,"smartoffice|0.65,0.25":61,"smartpc|0.80,0.4":11,"workstation|0.55,0.50":5,"workstation|0.25,0.85":1,"workstation|0.65,0.35":38,"workstation|0.75,0.35":28,"workstation|0.1,0.30":24,"workstation|0.15,0.3":12,"mobilethinkpad|0.65,0.25":54,"mobilethinkpad|0.45,0.30":45,"mobilethinkpad|0.40,0.20":3,"commercialiot|0.45,0.35":72,"commercialiot|0.90,0.30":117,"audiovideo|0.55,0.25":4,"audiovideo|0.85,0.30":23,"gaming|0.75,0.3":5,"workstation|0.7,0.50":3,"workstation|0.40,0.45":5,"smartoffice|0.80,0.55":7,"smartoffice|0.4,0.20":15,"commercialiot|0.60,0.70":3,"commercialiot|0.55,0.35":76,"audiovideo|0.00,0.30":64,"school|0.85,0.45":16,"audiovideo|0.90,0.25":26,"gaming|0.75,0.30":23,"workstation|0.05,0.55":6,"workstation|0.60,0.30":21,"mobilethinkpad|0.55,0.35":25,"mobilethinkpad|0.85,0.35":31,"mobilethinkpad|0.30,0.30":35,"commercialiot|0.55,0.60":6,"commercialiot|0.65,0.60":9,"audiovideo|0.85,0.4":7,"audiovideo|0.35,0.40":127,"audiovideo|0.15,0.4":14,"audiovideo|0,0.30":5,"workstation|0.20,0.25":24,"workstation|0.60,0.35":17,"workstation|0.40,0.65":7,"mobilethinkpad|0.10,0.45":22,"mobilethinkpad|0.45,0.25":35,"mobilethinkpad|0.85,0.30":39,"commercialiot|0.05,0.55":14,"commercialiot|0.20,0.3":10,"school|0.85,0.25":14,"workstation|0.05,0.50":5,"commercialiot|0.65,0.50":10,"commercialiot|0.55,0.30":108,"commercialiot|0.45,0.4":9,"entertainment|0.10,0.80":73,"gaming|0.95,0.40":102,"gaming|1,0.30":53,"gaming|0.85,0.30":162,"mobilethinkpad|0.45,0.35":17,"mobilethinkpad|0.25,0.30":45,"mobilethinkpad|0.60,0.30":32,"smartpc|0.65,0.80":1,"smartpc|0.80,0.40":10,"commercialiot|0.8,0.65":45,"commercialiot|0.6,0.30":61,"entertainment|0.40,0.35":81,"entertainment|0.45,0.35":87,"audiovideo|0.80,0.85":2,"audiovideo|0.50,0.55":6,"workstation|0.30,0.85":5,"workstation|0.1,0.55":8,"workstation|0.50,0.50":2,"commercialiot|0.45,0.30":29,"school|0.85,0.30":40,"school|0.30,0.35":20,"school|0.20,0.45":3,"smarthome|0.50,0.40":6,"smarthome|0.75,0.4":7,"gaming|0.60,0.65":68,"gaming|0.5,0.30":61,"gaming|0.25,0.25":95,"smartoffice|0.65,0.60":16,"smartoffice|0.35,0.35":15,"smartpc|0.05,0.65":46,"smartpc|0.80,0.45":49,"school|0.80,0.40":48,"school|0.3,0.30":54,"smarthome|0.55,0.35":14,"audiovideo|0.3,0.6":41,"audiovideo|0.10,0.35":90,"commercialiot|0.3,0.30":45,"commercialiot|0.10,0.25":55,"smarthome|0.75,0.55":14,"smarthome|0.8,0.60":3,"smarthome|0.65,0.30":28,"audiovideo|0.55,0.40":6,"audiovideo|0.75,0.55":14,"audiovideo|0.00,0.55":5,"smartoffice|0.35,0.30":13,"smartpc|0.80,0.30":24,"school|0.45,0.35":41,"entertainment|0.10,0.30":90,"workstation|0.2,0.25":10,"mobilethinkpad|0.80,0.60":5,"mobilethinkpad|0.80,0.30":21,"mobilethinkpad|0.70,0.30":40,"mobilethinkpad|0.40,0.25":41,"smartpc|0.55,0.35":14,"entertainment|0.05,0.65":5,"audiovideo|0.65,0.20":8,"smartoffice|0.30,0.30":15,"smartoffice|0.85,0.50":8,"audiovideo|0.95,0.25":46,"audiovideo|0.85,0.6":5,"audiovideo|0.05,0.55":8,"audiovideo|0.05,0.40":24,"workstation|0.05,0.3":21,"smarthome|0.70,0.50":4,"audiovideo|0,0.50":4,"audiovideo|0.1,0.55":4,"workstation|0.20,0.30":15,"school|0.90,0.55":8,"entertainment|0.10,0.5":3,"gaming|0.70,0.70":14,"gaming|0.80,0.70":5,"mobilethinkpad|0.05,0.55":12,"mobilethinkpad|0.30,0.20":15,"smartpc|0.35,0.35":26,"school|0.95,0.70":1,"audiovideo|0.90,0.75":10,"smartpc|0.25,0.65":3,"school|0.7,0.60":3,"entertainment|0.20,0.50":47,"audiovideo|0.30,0.50":18,"audiovideo|0.25,0.25":12,"mobilethinkpad|0.45,0.40":2,"mobilethinkpad|0.30,0.15":1,"entertainment|0.10,0.40":34,"gaming|0.80,0.65":15,"gaming|0.75,0.8":2,"mobilethinkpad|0.35,0.20":12,"smartoffice|0.95,0.30":22,"smartoffice|0.20,0.60":6,"commercialiot|0.75,0.30":80,"smarthome|0.05,0.45":14,"smarthome|0.00,0.70":1,"smarthome|0.85,0.40":7,"entertainment|0.60,0.85":7,"smarthome|0.20,0.85":2,"smarthome|0.3,0.65":1,"smarthome|0.35,0.6":1,"smarthome|0.45,0.55":5,"smarthome|0.45,0.5":6,"smarthome|0.45,0.45":18,"gaming|0.25,0.85":6,"mobilethinkpad|0.70,0.4":11,"workstation|0.75,0.45":13,"gaming|0.25,0.30":18,"workstation|0.50,0.35":18,"smarthome|0.50,0.50":3,"gaming|0.20,0.30":73,"smartoffice|0.85,0.40":12,"smarthome|0.80,0.35":26,"entertainment|0.70,0.30":51,"entertainment|0.15,0.35":151,"audiovideo|0.45,0.45":14,"gaming|0.65,0.60":19,"gaming|0.35,0.4":17,"gaming|0.05,0.5":31,"gaming|0.30,0.40":28,"gaming|0.15,0.40":11,"gaming|0.3,0.35":4,"gaming|0.4,0.40":1,"gaming|0.65,0.55":35,"gaming|0.45,0.40":67,"gaming|0.65,0.50":16,"smarthome|0.30,0.60":3,"audiovideo|0.00,0.4":7,"entertainment|0.85,0.75":11,"audiovideo|0.20,0.40":19,"audiovideo|0.70,0.45":11,"entertainment|0.85,0.65":10,"entertainment|0.45,0.5":6,"entertainment|0.55,0.35":85,"entertainment|0.75,0.3":5,"smarthome|0.1,0.50":1,"smarthome|0.60,0.4":3,"smarthome|0.80,0.40":9,"entertainment|0.80,0.75":6,"smarthome|0.55,0.40":9,"smartoffice|0.10,0.40":21,"smartoffice|0.35,0.40":7,"smartoffice|0.1,0.40":9,"smartoffice|0.55,0.40":12,"workstation|0.25,0.40":10,"workstation|0.05,0.45":6,"workstation|0.45,0.4":6,"smarthome|0.05,0.65":10,"smarthome|0.10,0.65":9,"workstation|0.65,0.45":9,"smarthome|0.2,0.55":3,"mobilethinkpad|0.40,0.40":10,"smartpc|0.45,0.35":25,"smartpc|0.60,0.40":7,"commercialiot|0.80,0.35":60,"school|0.75,0.40":6,"smarthome|0.25,0.80":4,"smarthome|0.25,0.85":3,"entertainment|0.8,0.90":1,"gaming|0.15,0.7":1,"entertainment|0.05,0.75":6,"audiovideo|0.40,0.65":9,"audiovideo|0.30,0.55":11,"audiovideo|0.55,0.75":4,"commercialiot|0.30,0.75":12,"commercialiot|0.70,0.70":4,"commercialiot|0.30,0.70":4,"commercialiot|0.70,0.65":4,"commercialiot|0.75,0.6":3,"commercialiot|0.80,0.75":5,"commercialiot|0.80,0.8":3,"entertainment|0.45,0.90":2,"entertainment|0.40,0.7":3,"entertainment|0.50,0.8":1,"commercialiot|0.80,0.85":3,"smarthome|0.20,0.8":2,"entertainment|0.75,0.75":2,"smarthome|0.20,0.70":3,"smarthome|0.25,0.6":4,"entertainment|0.80,0.7":1,"entertainment|0.80,0.60":2,"commercialiot|0.75,0.70":1,"entertainment|0.95,0.50":11,"commercialiot|0.75,0.85":1,"smarthome|0.00,0.85":1,"smarthome|0.30,0.4":3,"smarthome|0.15,0.65":7,"smarthome|0.15,0.60":3,"commercialiot|0.80,0.65":4,"smarthome|0.95,0.35":16,"smarthome|0.85,0.4":8,"commercialiot|0.80,0.90":1,"smarthome|0.75,0.35":23,"smarthome|0.8,0.35":8,"smarthome|0.8,0.30":12,"smarthome|0.75,0.30":38,"smarthome|0.30,0.65":1,"smarthome|0.35,0.50":11,"smarthome|0.50,0.30":11,"smarthome|0.65,0.20":21,"commercialiot|0.8,0.75":3,"entertainment|0.85,0.45":2,"smarthome|0.3,0.45":2,"entertainment|0.90,0.65":19,"smarthome|0.25,0.45":4,"entertainment|0.95,0.60":2,"smarthome|0.00,0.45":8,"entertainment|0.85,0.4":16,"entertainment|0.35,0.50":5,"school|0.00,0.60":2,"entertainment|0.40,0.70":5,"entertainment|0.45,0.70":5,"school|0.10,0.6":2,"school|0.50,0.60":11,"commercialiot|0.80,0.80":3,"gaming|0.1,0.65":2,"gaming|0.05,0.75":10,"gaming|0.05,0.65":44,"smarthome|0.25,0.65":7,"smarthome|0.40,0.50":3,"smarthome|0.6,0.40":1,"smarthome|0.80,0.25":23,"entertainment|0.80,0.85":4,"smarthome|0.35,0.85":1,"smarthome|0.30,0.85":6,"entertainment|0.80,0.80":4,"entertainment|0.1,0.70":5,"entertainment|0.10,0.65":2,"entertainment|0.55,0.40":24,"smarthome|0.3,0.85":1,"entertainment|0.80,0.90":2,"entertainment|0.8,0.80":3,"entertainment|0.80,0.70":5,"smarthome|0.20,0.60":3,"gaming|0.05,0.60":18,"gaming|0.10,0.65":7,"gaming|0.10,0.70":10,"gaming|0.05,0.85":7,"gaming|0.05,0.80":5,"gaming|0.05,0.8":4,"gaming|0.15,0.65":6,"gaming|0.15,0.70":12,"smarthome|0.95,0.40":8,"smarthome|0.95,0.4":6,"entertainment|0.55,0.60":5,"entertainment|0.55,0.65":7,"entertainment|0.55,0.7":2,"entertainment|0.55,0.70":2,"entertainment|0.55,0.55":3,"smarthome|0.80,0.3":10,"entertainment|0.60,0.55":10,"entertainment|0.95,0.65":8,"smarthome|0.7,0.30":9,"entertainment|0.60,0.50":9,"smarthome|0.25,0.40":12,"entertainment|0.95,0.55":5,"smarthome|0.40,0.40":7,"entertainment|0.95,0.70":3,"gaming|0.15,0.85":9,"gaming|0.10,0.75":37,"school|0.15,0.20":39,"commercialiot|0.90,0.25":62,"commercialiot|0.90,0.3":29,"commercialiot|0.9,0.25":14,"entertainment|0.85,0.70":20,"school|0.2,0.25":10,"smarthome|0.05,0.75":2,"gaming|0.10,0.85":6,"entertainment|0.45,0.7":2,"entertainment|0.80,0.50":11,"entertainment|0.80,0.55":12,"smarthome|0.00,0.8":3,"entertainment|0.7,0.60":1,"entertainment|0.7,0.65":2,"smarthome|0.00,0.7":1,"entertainment|0.80,0.5":1,"smarthome|0.05,0.55":9,"entertainment|0.90,0.70":15,"smarthome|0.10,0.75":5,"entertainment|0.90,0.80":5,"entertainment|0.90,0.75":16,"entertainment|0.90,0.8":1,"smarthome|0.10,0.7":2,"entertainment|0.9,0.75":1,"smarthome|0.10,0.70":3,"smarthome|0.05,0.60":8,"entertainment|0.90,0.7":5,"smarthome|0.1,0.75":1,"smarthome|0.1,0.65":2,"smarthome|0.75,0.45":10,"smarthome|0.15,0.55":11,"entertainment|0.85,0.55":4,"smarthome|0.15,0.50":6,"entertainment|0.9,0.55":3,"smarthome|0.20,0.45":4,"smarthome|0.35,0.45":2,"smarthome|0.4,0.5":1,"smarthome|0.50,0.55":17,"entertainment|0.95,0.8":1,"smarthome|0.50,0.60":18,"smarthome|0.35,0.65":2,"smarthome|0.30,0.6":2,"entertainment|0.85,0.6":4,"entertainment|0.85,0.60":5,"smarthome|0.20,0.50":2,"entertainment|0.9,0.6":2,"entertainment|0.9,0.60":5,"entertainment|0.90,0.60":8,"entertainment|0.55,0.75":4,"smarthome|0.10,0.50":7,"entertainment|0.70,0.85":9,"smarthome|0.20,0.65":5,"smarthome|0.25,0.60":6,"smarthome|0.15,0.4":8,"smarthome|0.35,0.25":39,"smarthome|0.50,0.35":9,"smarthome|0.55,0.30":14,"smarthome|0.65,0.25":18,"entertainment|0.95,0.40":21,"entertainment|0.80,0.35":32,"entertainment|0.55,0.30":55,"entertainment|0.3,0.35":31,"entertainment|0.7,0.25":10,"smarthome|0.05,0.35":48,"smarthome|0.20,0.30":27,"smarthome|0.45,0.3":7,"smarthome|0.50,0.25":26,"smarthome|0.30,0.80":2,"smarthome|0.70,0.5":1,"smarthome|0.65,0.45":3,"smarthome|0.25,0.90":1,"smarthome|0.25,0.55":5,"smarthome|0.6,0.35":6,"smarthome|0.90,0.40":7,"smarthome|0.90,0.35":69,"smarthome|0.90,0.4":11,"smarthome|0.25,0.75":11,"gaming|0.30,0.85":6,"entertainment|0.75,0.85":1,"entertainment|0.75,0.80":6,"smarthome|0.20,0.90":3,"entertainment|0.75,0.70":2,"smarthome|0.25,0.8":1,"entertainment|0.50,0.70":4,"entertainment|0.50,0.65":4,"entertainment|0.50,0.60":5,"smarthome|0.05,0.70":6,"entertainment|0.5,0.60":1,"entertainment|0.5,0.55":3,"entertainment|0.65,0.60":6,"smarthome|0.45,0.40":4,"smarthome|0.15,0.5":2,"smarthome|0.30,0.35":15,"smarthome|0.55,0.6":3,"entertainment|0.95,0.75":1,"entertainment|0.9,0.65":4,"entertainment|0.85,0.7":1,"smarthome|0.70,0.35":16,"smarthome|0.05,0.50":5,"smarthome|0.20,0.40":8,"smarthome|0.9,0.50":5,"smarthome|0.65,0.4":7,"smarthome|0.40,0.25":37,"smarthome|0.45,0.25":14,"smarthome|0.00,0.30":10,"smarthome|0.1,0.35":16,"smarthome|0.25,0.35":18,"smarthome|0.7,0.25":2,"smarthome|0.10,0.30":33,"smarthome|0.25,0.4":4,"smarthome|0.55,0.3":1,"smarthome|0.95,0.30":28,"smarthome|0.25,0.7":4,"smarthome|0.10,0.60":4,"entertainment|0.45,0.85":4,"entertainment|0.05,0.85":14,"entertainment|0.10,0.8":12,"entertainment|0.10,0.70":10,"entertainment|0.10,0.7":1,"entertainment|0.1,0.75":3,"entertainment|0.40,0.75":4,"entertainment|0.10,0.50":6,"entertainment|0.40,0.65":4,"entertainment|0.50,0.6":1,"entertainment|0.20,0.55":15,"entertainment|0.20,0.70":3,"entertainment|0.45,0.60":4,"entertainment|0.65,0.50":1,"entertainment|0.25,0.60":4,"entertainment|0.40,0.60":3,"gaming|0.20,0.80":14,"gaming|0.2,0.65":1,"gaming|0.05,0.6":3,"gaming|0.05,0.55":19,"gaming|0.00,0.6":2,"entertainment|0.50,0.50":3,"entertainment|0.30,0.75":2,"entertainment|0.10,0.75":21,"entertainment|0.1,0.55":2,"audiovideo|0.25,0.7":1,"gaming|0.1,0.70":3,"workstation|0.95,0.75":4,"workstation|0.85,0.70":16,"mobilethinkpad|0.45,0.55":6,"mobilethinkpad|0.20,0.50":4,"mobilethinkpad|0.05,0.50":8,"mobilethinkpad|0.40,0.3":7,"workstation|0.95,0.70":3,"workstation|0.9,0.65":4,"mobilethinkpad|0.20,0.45":4,"mobilethinkpad|0.05,0.45":18,"workstation|0.95,0.65":12,"mobilethinkpad|0.10,0.50":11,"mobilethinkpad|0.1,0.5":2,"workstation|0.90,0.8":1,"mobilethinkpad|0.40,0.50":8,"workstation|0.95,0.7":3,"workstation|0.90,0.70":4,"mobilethinkpad|0.1,0.50":4,"workstation|0.80,0.55":14,"workstation|0.75,0.50":17,"mobilethinkpad|0.25,0.6":5,"workstation|0.90,0.75":5,"mobilethinkpad|0.25,0.55":19,"mobilethinkpad|0.10,0.60":12,"mobilethinkpad|0.40,0.55":4,"mobilethinkpad|0.05,0.5":5,"mobilethinkpad|0.10,0.55":17,"mobilethinkpad|0.05,0.40":8,"workstation|0.85,0.75":9,"mobilethinkpad|0.25,0.50":10,"smartoffice|0.60,0.20":30,"smartoffice|0.65,0.30":24,"workstation|0.85,0.80":5,"mobilethinkpad|0.05,0.4":7,"workstation|0.85,0.60":5,"commercialiot|0.15,0.65":4,"mobilethinkpad|0.15,0.50":7,"gaming|0.00,0.65":12,"mobilethinkpad|0.25,0.65":6,"mobilethinkpad|0.00,0.45":7,"commercialiot|0.8,0.70":1,"smartoffice|0.40,0.25":58,"smartoffice|0.90,0.65":7,"smartoffice|0.45,0.3":2,"smartoffice|0.85,0.70":5,"smartoffice|0.8,0.60":1,"workstation|0.85,0.65":13,"mobilethinkpad|0.20,0.60":6,"mobilethinkpad|0.20,0.55":15,"workstation|0.35,0.80":4,"workstation|0.4,0.80":1,"workstation|0.35,0.65":7,"smartoffice|0.90,0.75":5,"workstation|0.30,0.60":7,"smartoffice|0.90,0.70":7,"workstation|0.35,0.55":9,"smartoffice|0.25,0.25":3,"smartoffice|0.30,0.25":4,"mobilethinkpad|0.2,0.55":1,"smartoffice|0.35,0.25":34,"mobilethinkpad|0.50,0.55":9,"mobilethinkpad|0.2,0.50":1,"smartoffice|0.80,0.45":3,"mobilethinkpad|0.00,0.40":9,"smartoffice|0.75,0.30":20,"smartoffice|0.25,0.20":2,"commercialiot|0.75,0.75":1,"mobilethinkpad|0.50,0.50":4,"mobilethinkpad|0.25,0.75":12,"commercialiot|0.25,0.70":3,"commercialiot|0.20,0.60":4,"commercialiot|0.10,0.45":7,"smartoffice|0.55,0.3":11,"workstation|0.85,0.7":3,"smartoffice|0.45,0.25":57,"smartoffice|0.5,0.25":7,"workstation|0.60,0.75":22,"mobilethinkpad|0.15,0.80":62,"smartoffice|0.35,0.3":5,"mobilethinkpad|0.30,0.75":3,"smartoffice|0.65,0.3":9,"mobilethinkpad|0.35,0.8":5,"mobilethinkpad|0.35,0.75":9,"mobilethinkpad|0.35,0.70":9,"smartoffice|0.65,0.20":23,"workstation|0.10,0.45":9,"mobilethinkpad|0.35,0.80":1,"smartoffice|0.9,0.55":3,"smartoffice|0.80,0.35":30,"smartpc|0.95,0.60":2,"mobilethinkpad|0.25,0.90":1,"commercialiot|0.3,0.6":1,"commercialiot|0.60,0.75":1,"commercialiot|0.30,0.55":11,"commercialiot|0.30,0.50":5,"mobilethinkpad|0.40,0.75":27,"mobilethinkpad|0.15,0.60":2,"commercialiot|0.30,0.6":3,"workstation|0.80,0.80":6,"mobilethinkpad|0.40,0.70":38,"commercialiot|0.65,0.65":7,"mobilethinkpad|0.45,0.75":9,"mobilethinkpad|0.15,0.85":87,"smartpc|0.30,0.8":1,"workstation|0.65,0.75":4,"workstation|0.75,0.90":3,"workstation|0.60,0.8":13,"workstation|0.45,0.85":8,"workstation|0.35,0.50":3,"workstation|0.6,0.75":171,"workstation|0.6,0.70":13,"gaming|0.05,0.45":77,"gaming|0.20,0.40":51,"gaming|0.35,0.35":33,"workstation|0.6,0.80":116,"gaming|0.05,0.7":2,"workstation|0.6,0.8":41,"mobilethinkpad|0.40,0.85":4,"mobilethinkpad|0.05,0.65":11,"mobilethinkpad|0.40,0.80":4,"mobilethinkpad|0.4,0.75":3,"mobilethinkpad|0.50,0.60":6,"workstation|0.6,0.7":1,"mobilethinkpad|0.4,0.70":4,"workstation|0.60,0.70":4,"mobilethinkpad|0.4,0.8":2,"mobilethinkpad|0.40,0.8":6,"gaming|0.15,0.55":6,"gaming|0.00,0.55":33,"gaming|0.30,0.35":26,"gaming|0.25,0.35":96,"mobilethinkpad|0.40,0.65":23,"gaming|0.35,0.45":15,"gaming|0.10,0.35":102,"gaming|0.15,0.30":31,"mobilethinkpad|0.40,0.7":9,"audiovideo|0.50,0.5":1,"gaming|0.00,0.60":10,"gaming|0.1,0.50":5,"entertainment|0.6,0.40":2,"commercialiot|0.35,0.70":9,"commercialiot|0.80,0.70":5,"entertainment|0.7,0.35":3,"smarthome|0.45,0.35":13,"smarthome|0.60,0.30":20,"gaming|0.3,0.45":2,"mobilethinkpad|0.45,0.65":27,"smartoffice|0.50,0.3":9,"smartoffice|0.40,0.35":6,"smartoffice|0.30,0.35":13,"mobilethinkpad|0.5,0.65":1,"smartoffice|0.45,0.30":18,"smartoffice|0.8,0.30":7,"workstation|0.85,0.85":4,"smartoffice|0.8,0.50":2,"workstation|0.40,0.40":4,"smartoffice|0.95,0.40":11,"smartoffice|0.70,0.25":15,"smartoffice|0.50,0.20":27,"workstation|0.85,0.8":1,"mobilethinkpad|0.1,0.45":8,"mobilethinkpad|0.40,0.60":3,"mobilethinkpad|0.45,0.60":6,"mobilethinkpad|0.45,0.85":3,"mobilethinkpad|0.45,0.8":8,"mobilethinkpad|0.30,0.90":2,"mobilethinkpad|0.30,0.95":1,"workstation|0.35,0.5":4,"mobilethinkpad|0.5,0.75":1,"mobilethinkpad|0.5,0.70":2,"mobilethinkpad|0.45,0.70":22,"workstation|0.60,0.80":60,"workstation|0.80,0.85":2,"workstation|0.6,0.85":39,"workstation|0.75,0.65":6,"mobilethinkpad|0.15,0.90":11,"mobilethinkpad|0.15,0.95":1,"workstation|0.55,0.80":40,"workstation|0.4,0.65":5,"workstation|0.75,0.85":5,"mobilethinkpad|0.00,0.70":3,"workstation|0.70,0.95":1,"mobilethinkpad|0.25,0.85":2,"workstation|0.70,0.90":4,"workstation|0.70,0.85":10,"workstation|0.70,0.80":13,"workstation|0.90,0.85":1,"workstation|0.70,0.75":5,"mobilethinkpad|0.3,0.70":4,"workstation|0.70,0.8":3,"mobilethinkpad|0.3,0.75":1,"mobilethinkpad|0.30,0.7":1,"mobilethinkpad|0.25,0.70":2,"commercialiot|0.15,0.85":13,"commercialiot|0.10,0.85":2,"workstation|0.75,0.75":2,"mobilethinkpad|0.30,0.8":1,"commercialiot|0.15,0.7":3,"commercialiot|0.55,0.50":13,"school|0.00,0.6":1,"gaming|0.05,0.70":15,"smartoffice|0.65,0.70":10,"gaming|0.00,0.80":3,"smartoffice|0.5,0.50":3,"mobilethinkpad|0.50,0.70":3,"smarthome|0.80,0.65":7,"smarthome|0.4,0.4":1,"gaming|0.8,0.30":5,"smarthome|0.8,0.55":4,"entertainment|0.8,0.35":18,"gaming|0.65,0.35":20,"gaming|0.10,0.80":6,"gaming|0.65,0.4":17,"gaming|0.7,0.35":14,"school|0.20,0.50":4,"commercialiot|0.80,0.40":14,"entertainment|0.25,0.35":127,"gaming|0.6,0.65":5,"gaming|0.50,0.50":40,"gaming|0.2,0.35":11,"gaming|0.55,0.30":32,"smarthome|0.65,0.35":24,"smarthome|0.60,0.25":9,"gaming|0.55,0.35":32,"smarthome|0.60,0.3":1,"gaming|0.60,0.40":24,"gaming|0.50,0.30":49,"gaming|0.4,0.35":9,"entertainment|0.95,0.35":93,"school|0.60,0.40":5,"commercialiot|0.45,0.45":27,"commercialiot|0.20,0.4":6,"commercialiot|0.05,0.35":29,"entertainment|0.85,0.5":2,"smartpc|0.35,0.40":8,"entertainment|0.20,0.4":39,"smartpc|0.35,0.4":5,"smartpc|0.40,0.4":3,"school|0.65,0.60":2,"gaming|0.15,0.3":4,"smarthome|0.9,0.30":4,"gaming|0.2,0.30":20,"gaming|0.55,0.40":62,"gaming|0.15,0.35":16,"gaming|0.15,0.25":10,"gaming|0.60,0.35":80,"gaming|0.5,0.35":9,"smarthome|0.85,0.25":20,"smarthome|0.75,0.25":45,"smartoffice|0.2,0.80":1,"smartoffice|0.20,0.8":2,"smartoffice|0.20,0.80":2,"smartoffice|0.20,0.75":7,"entertainment|0.80,0.65":2,"entertainment|0.30,0.65":4,"gaming|0.80,0.85":1,"gaming|0.75,0.45":53,"smartoffice|0.20,0.85":1,"smartoffice|0.15,0.75":5,"mobilethinkpad|0.80,0.65":17,"mobilethinkpad|0.85,0.65":10,"gaming|0.95,0.80":5,"gaming|0.95,0.65":10,"mobilethinkpad|0.85,0.60":12,"smartpc|0.35,0.45":11,"smarthome|0.55,0.65":24,"gaming|0.90,0.6":2,"smartpc|0.45,0.45":45,"gaming|0.9,0.55":3,"gaming|0.80,0.45":43,"smartpc|0.50,0.35":16,"gaming|0.75,0.50":54,"gaming|0.55,0.45":32,"gaming|0.75,0.55":55,"gaming|0.60,0.50":83,"gaming|0.85,0.50":19,"gaming|1,0.40":4,"smartpc|0.65,0.25":32,"gaming|0.85,0.7":2,"gaming|0.75,0.35":39,"gaming|0.95,0.60":8,"smartpc|0.60,0.25":15,"smarthome|0.05,0.25":18,"audiovideo|0.25,0.55":8,"audiovideo|0.3,0.45":4,"audiovideo|0.4,0.40":14,"mobilethinkpad|0.9,0.35":3,"audiovideo|0.30,0.45":5,"audiovideo|0.4,0.45":14,"smarthome|0.55,0.60":13,"audiovideo|0.40,0.50":20,"workstation|0.90,0.35":24,"smarthome|0.55,0.45":6,"mobilethinkpad|0.00,0.4":3,"gaming|0.50,0.65":8,"gaming|0.70,0.45":79,"gaming|0.20,0.60":17,"commercialiot|0.10,0.40":14,"school|0.3,0.35":5,"gaming|0.65,0.45":36,"smarthome|0.1,0.25":4,"audiovideo|0.10,0.40":20,"smarthome|0.05,0.30":34,"audiovideo|0.40,0.35":37,"audiovideo|0.40,0.4":14,"audiovideo|0.45,0.40":10,"school|0.80,0.4":4,"smartoffice|0.75,0.85":4,"smartoffice|0.65,0.85":4,"smartoffice|0.30,0.65":4,"audiovideo|0.45,0.4":11,"gaming|0.20,0.65":4,"smarthome|0.00,0.35":14,"gaming|0.70,0.55":60,"gaming|0.45,0.75":6,"gaming|0.85,0.55":14,"workstation|0.60,0.85":67,"audiovideo|0.50,0.65":6,"audiovideo|0.55,0.60":8,"audiovideo|0.20,0.45":10,"audiovideo|0.40,0.40":28,"audiovideo|0.50,0.80":2,"audiovideo|0.05,0.60":5,"entertainment|0.95,0.30":16,"audiovideo|0.30,0.35":63,"audiovideo|0.25,0.35":59,"mobilethinkpad|0.15,0.8":13,"audiovideo|0.65,0.65":8,"mobilethinkpad|0.15,0.75":10,"entertainment|0.45,0.45":10,"entertainment|0.60,0.40":7,"audiovideo|0.45,0.65":6,"gaming|0.95,0.85":2,"entertainment|0.85,0.90":20,"entertainment|0.75,0.35":109,"smarthome|0.35,0.70":3,"smarthome|0.35,0.8":2,"smarthome|0.85,0.50":8,"entertainment|0.85,0.95":3,"entertainment|0.75,0.25":4,"gaming|0.60,0.60":4,"smarthome|0.30,0.75":6,"entertainment|0.85,0.85":16,"smartoffice|0.15,0.45":6,"smartoffice|0.05,0.45":32,"smarthome|0.30,0.8":1,"entertainment|0.00,0.25":46,"school|0.75,0.80":1,"audiovideo|0.95,0.3":15,"smarthome|0.30,0.70":7,"gaming|0.95,0.75":9,"smarthome|0.35,0.80":5,"gaming|0.90,0.75":10,"gaming|0.55,0.75":10,"workstation|0.05,0.40":9,"gaming|0.75,0.65":28,"gaming|0.50,0.60":26,"gaming|0.45,0.45":16,"workstation|0.55,0.35":24,"audiovideo|1,0.25":5,"gaming|0.25,0.45":12,"smarthome|0.35,0.75":8,"workstation|0.15,0.65":4,"smartoffice|0.80,0.75":5,"entertainment|0.70,0.25":14,"gaming|0.10,0.60":17,"gaming|0.20,0.55":14,"audiovideo|0.85,0.55":10,"entertainment|0.45,0.40":26,"entertainment|0.65,0.35":64,"entertainment|0.95,0.4":20,"commercialiot|0.3,0.90":1,"commercialiot|0.3,0.8":1,"mobilethinkpad|0.20,0.35":24,"entertainment|0.65,0.20":7,"entertainment|0.65,0.25":581,"mobilethinkpad|0.30,0.25":25,"mobilethinkpad|0.90,0.30":15,"smartpc|0.05,0.50":5,"gaming|0.15,0.50":11,"smartpc|0.4,0.35":10,"gaming|0.30,0.45":8,"smartpc|0.65,0.35":22,"smartoffice|0.05,0.8":3,"mobilethinkpad|0.00,0.35":4,"entertainment|0.40,0.25":13,"smartpc|0.20,0.35":34,"entertainment|0.55,0.25":55,"commercialiot|0.15,0.30":40,"commercialiot|0.05,0.3":14,"smartpc|0.55,0.25":34,"entertainment|0.45,0.25":9,"commercialiot|0.1,0.35":17,"smartpc|0.75,0.25":24,"commercialiot|0.00,0.3":4,"commercialiot|0.65,0.7":4,"entertainment|0.40,0.30":32,"entertainment|0.4,0.35":5,"entertainment|0.40,0.40":22,"entertainment|0.5,0.4":14,"gaming|0.00,0.75":12,"entertainment|0.5,0.3":2,"audiovideo|0.30,0.70":5,"audiovideo|0.15,0.65":2,"gaming|0.25,0.75":11,"entertainment|0.50,0.25":6,"entertainment|0.40,0.4":4,"audiovideo|0.05,0.75":23,"audiovideo|0.1,0.70":5,"audiovideo|0.60,0.80":1,"audiovideo|0.10,0.80":23,"audiovideo|0.20,0.65":1,"audiovideo|0.10,0.8":8,"entertainment|0.05,0.80":5,"entertainment|0.35,0.40":11,"audiovideo|0.10,0.90":22,"audiovideo|0.1,0.85":3,"audiovideo|0.05,0.5":4,"audiovideo|0.7,0.40":4,"audiovideo|0.15,0.40":23,"entertainment|0.15,0.4":14,"entertainment|0.85,0.80":5,"entertainment|0.15,0.30":99,"entertainment|0.75,0.55":1,"entertainment|0.25,0.45":22,"audiovideo|0.10,0.85":36,"audiovideo|0.15,0.80":10,"audiovideo|0.20,0.35":36,"audiovideo|0.65,0.95":2,"audiovideo|0.35,0.4":29,"entertainment|0.00,0.4":7,"audiovideo|0.20,0.5":3,"audiovideo|0.25,0.40":22,"entertainment|0.00,0.30":55,"audiovideo|0.05,0.45":7,"entertainment|0.25,0.3":3,"audiovideo|0.00,0.45":5,"entertainment|0.25,0.30":70,"audiovideo|0.1,0.40":5,"entertainment|0.25,0.25":6,"audiovideo|0.05,0.4":13,"audiovideo|0.10,0.95":1,"audiovideo|0.00,0.70":8,"audiovideo|0.10,0.50":7,"audiovideo|0.15,0.95":5,"entertainment|0.45,0.30":22,"entertainment|0.5,0.25":5,"audiovideo|0.85,0.35":32,"audiovideo|0.95,0.35":41,"entertainment|0.1,0.35":20,"entertainment|0.2,0.30":40,"entertainment|0.30,0.45":18,"audiovideo|0.60,0.40":11,"entertainment|0.20,0.25":5,"gaming|0.9,0.4":4,"gaming|0.85,0.4":14,"audiovideo|0.9,0.35":6,"gaming|0.1,0.75":4,"audiovideo|0.80,0.30":6,"entertainment|0.3,0.40":13,"audiovideo|0.7,0.45":1,"entertainment|0.25,0.4":32,"audiovideo|0.35,0.45":19,"entertainment|0.3,0.4":3,"audiovideo|0.05,0.30":42,"gaming|0.20,0.45":42,"entertainment|0.2,0.25":1,"gaming|0.25,0.40":40,"audiovideo|0.20,0.50":7,"entertainment|0.2,0.50":2,"entertainment|0.10,0.4":9,"audiovideo|0.15,0.90":10,"entertainment|0.00,0.40":13,"entertainment|0.05,0.30":78,"audiovideo|0.15,0.85":13,"audiovideo|0.05,0.65":99,"audiovideo|0.1,0.30":6,"entertainment|0.3,0.30":24,"audiovideo|0.55,0.55":13,"entertainment|0.30,0.35":38,"entertainment|0.30,0.30":17,"entertainment|0.35,0.70":3,"entertainment|0.95,0.25":3,"entertainment|0.70,0.40":11,"audiovideo|0.40,0.45":30,"commercialiot|0.70,0.85":4,"entertainment|0.75,0.45":6,"smarthome|0.00,0.60":3,"smarthome|0.05,0.40":15,"audiovideo|0.70,0.35":50,"gaming|0.85,0.80":1,"gaming|0.40,0.80":3,"smarthome|0.70,0.45":1,"entertainment|0.20,0.20":1,"entertainment|0.05,0.25":16,"smartoffice|0.15,0.4":8,"smartoffice|0.45,0.35":8,"entertainment|0.00,0.20":1,"gaming|0.55,0.90":2,"entertainment|0.05,0.20":3,"audiovideo|0.45,0.70":8,"gaming|0.5,0.70":2,"gaming|0.70,0.60":19,"audiovideo|0.45,0.75":2,"entertainment|0.15,0.40":35,"gaming|1,0.35":5,"audiovideo|0.45,0.50":17,"school|0.75,0.35":70,"audiovideo|0.2,0.35":10,"school|0.05,0.35":40,"gaming|0.15,0.75":3,"entertainment|0.30,0.50":11,"audiovideo|0.4,0.65":3,"gaming|0.8,0.35":19,"audiovideo|0.35,0.50":16,"audiovideo|0.4,0.50":6,"entertainment|0.95,0.3":2,"audiovideo|0.60,0.55":11,"audiovideo|0.20,0.55":6,"audiovideo|0.70,0.30":29,"gaming|0.60,0.7":1,"gaming|0.55,0.50":47,"gaming|0.50,0.4":3,"gaming|0.85,0.25":47,"gaming|0.40,0.40":22,"audiovideo|0.4,0.35":11,"gaming|0.00,0.50":35,"audiovideo|0.20,0.30":24,"gaming|0.8,0.8":1,"audiovideo|0.60,0.45":8,"audiovideo|0.65,0.50":6,"audiovideo|0.30,0.6":1,"entertainment|0.40,0.5":2,"audiovideo|0.75,0.40":106,"gaming|0.75,0.6":6,"gaming|0.90,0.60":13,"gaming|0.95,0.45":15,"gaming|0.60,0.85":1,"gaming|0.90,0.45":12,"gaming|0.80,0.4":23,"gaming|0.75,0.25":5,"smartoffice|0.25,0.60":6,"school|0.85,0.65":6,"school|0.85,0.50":4,"gaming|0.80,0.3":4,"audiovideo|0.55,0.35":17,"mobilethinkpad|0.75,0.30":22,"audiovideo|0.7,0.3":1,"workstation|0.35,0.3":2,"mobilethinkpad|0.20,0.40":3,"workstation|0.1,0.25":5,"audiovideo|0.6,0.20":1,"mobilethinkpad|0.75,0.5":2,"smartoffice|0.60,0.90":2,"smartoffice|0.50,0.70":4,"commercialiot|0.25,0.90":1,"smarthome|0.10,0.4":11,"commercialiot|0.30,0.85":1,"gaming|0.8,0.25":5,"commercialiot|0.35,0.75":3,"commercialiot|0.35,0.65":7,"commercialiot|0.75,0.60":4,"gaming|0.70,0.25":2,"commercialiot|0.40,0.60":14,"commercialiot|0.70,0.50":4,"gaming|0.90,0.65":8,"commercialiot|0.65,0.45":14,"entertainment|0.25,0.55":11,"gaming|0.8,0.40":8,"audiovideo|0.10,0.75":12,"gaming|0.80,0.25":23,"gaming|0.7,0.25":3,"commercialiot|0.70,0.80":5,"audiovideo|0.05,0.20":4,"school|0.70,0.45":4,"commercialiot|0.30,0.30":38,"smartpc|0.80,0.25":38,"gaming|0.8,0.4":2,"audiovideo|0.1,0.20":2,"smarthome|0.90,0.55":9,"smarthome|0.80,0.45":2,"smarthome|0.95,0.7":2,"gaming|0.60,0.45":119,"gaming|0.7,0.30":13,"smarthome|0.25,0.25":8,"smarthome|0.10,0.3":1,"smarthome|0.15,0.30":25,"workstation|0.65,0.90":5,"audiovideo|0.1,0.90":3,"entertainment|0.85,0.35":69,"gaming|0.70,0.6":7,"entertainment|0.75,0.20":1,"audiovideo|0.05,0.25":29,"gaming|0.35,0.95":2,"gaming|0.6,0.45":10,"gaming|0.9,0.35":9,"workstation|0.7,0.75":2,"gaming|0.00,0.30":7,"audiovideo|0.7,0.25":5,"gaming|0.05,0.4":33,"gaming|0.05,0.40":40,"audiovideo|0.85,0.20":4,"mobilethinkpad|0.90,0.45":10,"mobilethinkpad|0.70,0.35":26,"smartoffice|0.95,0.65":6,"gaming|0.05,0.30":27,"smartoffice|0.85,0.60":10,"smartoffice|0.75,0.50":13,"smartoffice|0.50,0.30":12,"gaming|0.65,0.65":28,"audiovideo|0.20,0.3":2,"audiovideo|0.00,0.8":3,"audiovideo|0.20,0.25":9,"smartoffice|0.20,0.35":24,"smartoffice|0.3,0.4":1,"entertainment|0.90,0.25":2,"smartoffice|0.3,0.35":7,"gaming|0.85,0.75":7,"audiovideo|0,0.4":1,"smartoffice|0.2,0.35":9,"smartoffice|0.15,0.35":37,"audiovideo|0.65,0.45":9,"smarthome|0.2,0.45":1,"audiovideo|0.80,0.40":49,"gaming|0.9,0.30":12,"entertainment|0.90,0.4":22,"workstation|0.55,0.85":17,"workstation|0.7,0.85":1,"audiovideo|0.15,1":1,"audiovideo|0.35,0.30":54,"workstation|0.55,0.75":30,"workstation|0.55,0.8":17,"gaming|0.50,0.55":20,"gaming|0.7,0.55":13,"gaming|0.9,0.40":6,"entertainment|0.35,0.65":6,"gaming|0.00,0.45":19,"gaming|0.95,0.90":2,"smartoffice|0.35,0.75":3,"smartoffice|0.40,0.50":3,"smartoffice|0.7,0.4":1,"smartoffice|0.85,0.4":14,"workstation|0.15,0.35":21,"gaming|0.45,0.30":209,"gaming|0.20,0.35":12,"audiovideo|0.30,0.4":21,"mobilethinkpad|0.2,0.30":4,"gaming|1,0.80":1,"gaming|0.3,0.60":96,"smartoffice|0.00,0.50":7,"smartpc|0.05,0.40":9,"gaming|0.95,0.95":1,"smartpc|0.55,0.30":20,"smartpc|0.6,0.30":6,"gaming|0.9,0.45":2,"smartpc|0.60,0.30":17,"smartpc|0.9,0.3":4,"commercialiot|0.00,0.30":57,"commercialiot|0.05,0.25":143,"smartoffice|0.20,0.90":2,"commercialiot|0.25,0.35":31,"gaming|0.30,0.4":5,"commercialiot|0.35,0.30":82,"commercialiot|0.00,0.25":47,"smartoffice|0.30,0.75":6,"school|0.90,0.50":9,"smartoffice|0.2,0.65":1,"school|0.75,0.50":3,"school|0.45,0.40":13,"commercialiot|0.00,0.50":14,"smartpc|0.95,0.40":4,"audiovideo|0.6,0.60":3,"school|0.90,0.65":4,"smartoffice|0.15,0.65":6,"smartoffice|0.05,0.50":14,"commercialiot|0.8,0.8":1,"workstation|0.95,0.50":13,"entertainment|0.75,0.40":12,"audiovideo|0.2,0.25":2,"school|0.50,0.8":2,"school|0.45,0.75":6,"school|0.85,0.75":2,"gaming|0.6,0.4":8,"audiovideo|0.70,0.75":4,"smartoffice|0.90,0.40":6,"audiovideo|0.70,0.60":8,"audiovideo|0.30,0.65":7,"smartoffice|0.80,0.40":4,"smarthome|0.45,0.70":5,"smarthome|0.50,0.65":19,"commercialiot|0.25,0.30":49,"commercialiot|0.90,0.8":1,"mobilethinkpad|0.75,0.35":35,"smarthome|0.55,0.70":23,"smarthome|0.55,0.7":6,"workstation|0.65,0.80":4,"workstation|0.7,0.8":1,"commercialiot|0.10,0.8":1,"entertainment|0.6,0.30":17,"smarthome|0.65,0.8":1,"smarthome|0.65,0.80":2,"entertainment|0.60,0.35":75,"smarthome|0.65,0.85":3,"smarthome|0.7,0.80":1,"school|0.90,0.7":2,"school|0.80,0.45":5,"school|0.55,0.40":7,"school|0.25,0.3":6,"gaming|0.40,0.35":74,"school|0.45,0.30":35,"school|0.85,0.35":49,"school|0.70,0.35":20,"school|0.40,0.30":42,"school|0.40,0.35":32,"school|0.15,0.35":52,"audiovideo|0.25,0.85":5,"commercialiot|0.40,0.45":14,"commercialiot|0.25,0.40":12,"commercialiot|0.1,0.30":6,"commercialiot|0,0.3":1,"smartpc|0.70,0.35":15,"smarthome|0.75,0.75":4,"mobilethinkpad|0.95,0.35":3,"commercialiot|0.30,0.40":19,"audiovideo|0.2,0.85":2,"audiovideo|0.25,0.70":4,"smarthome|0.8,0.8":2,"audiovideo|0.15,0.50":5,"gaming|0.10,0.40":82,"smarthome|0.90,0.65":18,"gaming|0.50,0.35":64,"gaming|0.5,0.25":15,"gaming|0.3,0.25":9,"gaming|0.20,0.8":3,"commercialiot|0.15,0.55":6,"mobilethinkpad|0.65,0.6":2,"workstation|0.65,0.8":2,"workstation|0.80,0.45":16,"gaming|0.50,0.25":32,"gaming|0.35,0.60":12,"workstation|0.4,0.85":1,"workstation|0.85,0.5":5,"gaming|0.35,0.70":2,"workstation|0.85,0.45":22,"workstation|0.75,0.60":10,"mobilethinkpad|0.20,0.7":2,"gaming|0.45,0.3":19,"mobilethinkpad|0.20,0.70":3,"workstation|0.90,0.60":9,"workstation|0.50,0.75":3,"workstation|0.40,0.7":2,"workstation|0.90,0.50":29,"gaming|0.1,0.6":6,"workstation|0.40,0.55":6,"gaming|0.45,0.25":10,"gaming|0.30,0.3":5,"gaming|0.50,0.3":21,"gaming|0.10,0.4":17,"workstation|0.55,0.70":1,"workstation|0.30,0.50":8,"workstation|0.4,0.50":10,"mobilethinkpad|0.20,0.75":3,"gaming|0.40,0.30":65,"workstation|0.85,0.40":27,"workstation|0.65,0.30":42,"workstation|0.85,0.35":35,"smartpc|0.30,0.35":20,"smartoffice|0.80,0.30":8,"commercialiot|0.65,0.30":138,"gaming|0.3,0.30":15,"commercialiot|0.65,0.35":79,"commercialiot|0.05,0.40":11,"audiovideo|0.05,0.85":12,"mobilethinkpad|0.95,0.65":10,"smartoffice|0.50,0.65":5,"smartpc|0.45,0.4":4,"commercialiot|0.65,0.4":21,"smartpc|0.85,0.4":5,"audiovideo|0.00,0.65":8,"commercialiot|0.40,0.40":4,"smartoffice|0.45,0.20":35,"smartpc|0.45,0.30":18,"commercialiot|0.95,0.30":88,"school|0.15,0.25":54,"smartpc|0.45,0.3":5,"smartpc|0.75,0.20":9,"smartpc|0.5,0.25":2,"audiovideo|0.00,0.60":7,"smartoffice|0.50,0.25":40,"smartpc|0.45,0.25":8,"commercialiot|0.80,0.4":2,"smartpc|0.8,0.20":6,"school|0.10,0.3":6,"commercialiot|0.85,0.40":10,"smartpc|0.40,0.30":9,"smartpc|0.8,0.25":4,"commercialiot|0.85,0.45":2,"smarthome|0.15,0.25":5,"audiovideo|0.00,0.75":8,"smartpc|0.40,0.25":12,"commercialiot|0.35,0.4":8,"gaming|0.7,0.50":27,"commercialiot|0.2,0.40":4,"smartpc|0.40,0.3":2,"smartpc|0.80,0.20":7,"commercialiot|0.65,0.40":25,"school|0.10,0.20":27,"school|0.95,0.65":3,"audiovideo|0.00,0.7":2,"gaming|0.95,0.8":1,"gaming|0.55,0.80":1,"smartpc|0.4,0.25":7,"school|0.1,0.25":8,"gaming|0.55,0.8":3,"school|0.70,0.25":29,"workstation|0.80,0.50":14,"smartpc|0.35,0.25":16,"school|0.80,0.65":3,"school|0.1,0.3":4,"smarthome|0.70,0.70":6,"workstation|0.70,0.45":10,"mobilethinkpad|0.45,0.20":10,"school|0.75,0.25":30,"workstation|0.70,0.50":19,"mobilethinkpad|0.35,0.3":5,"school|0.10,0.30":25,"workstation|0.70,0.55":21,"commercialiot|0.75,0.40":20,"commercialiot|0.60,0.35":67,"commercialiot|0.75,0.45":12,"smartoffice|0.15,0.50":9,"commercialiot|0.60,0.30":64,"gaming|0.25,0.70":12,"smartoffice|0.50,0.35":13,"smartpc|0.30,0.25":15,"audiovideo|0.00,0.85":4,"school|0.80,0.30":48,"gaming|0.25,0.7":1,"school|0.80,0.55":8,"gaming|0.25,0.65":13,"commercialiot|0.45,0.55":14,"commercialiot|0.90,0.45":5,"commercialiot|0.70,0.45":8,"smarthome|0.70,0.8":1,"commercialiot|0.45,0.50":31,"school|0.85,0.55":7,"gaming|0.35,0.30":39,"smartpc|0.30,0.3":2,"smartpc|0.70,0.25":8,"commercialiot|0.60,0.45":18,"smartoffice|0.60,0.75":5,"commercialiot|0.60,0.50":7,"smartoffice|0.60,0.65":5,"school|0.9,0.55":1,"gaming|0.10,0.90":5,"smartoffice|0.20,0.55":8,"smartpc|0.85,0.25":34,"school|0.5,0.20":2,"commercialiot|0.40,0.75":5,"commercialiot|0.70,0.30":86,"commercialiot|0.4,0.55":7,"commercialiot|0.9,0.35":15,"commercialiot|0.85,0.30":69,"smartpc|0.75,0.60":18,"entertainment|0.70,0.90":7,"mobilethinkpad|0.90,0.55":14,"smartpc|0.55,0.5":1,"smartpc|0.35,0.55":4,"mobilethinkpad|0.80,0.50":14,"smartpc|0.15,0.60":7,"commercialiot|0.10,0.35":28,"commercialiot|0.80,0.30":146,"mobilethinkpad|0.90,0.40":2,"commercialiot|0.00,0.4":6,"school|0.00,0.30":33,"gaming|0.3,0.8":1,"gaming|0.10,0.30":27,"smartpc|0.05,0.45":4,"commercialiot|0.85,0.70":96,"school|0.15,0.3":103,"audiovideo|0.55,0.85":1,"gaming|0.80,0.7":98,"audiovideo|0.6,0.80":94,"smartoffice|0.95,0.4":9,"smartoffice|0.95,0.35":51,"school|0.05,0.30":73,"smarthome|0.90,0.70":19,"smarthome|0.90,0.45":6,"mobilethinkpad|0.65,0.3":10,"school|0.1,0.30":10,"smarthome|0.90,0.60":13,"audiovideo|0.65,0.80":1,"mobilethinkpad|0.65,0.30":60,"audiovideo|0.2,0.40":6,"smarthome|0.90,0.50":10,"entertainment|0.35,0.8":1,"audiovideo|0.25,0.65":7,"smartpc|0.40,0.40":4,"smarthome|0.9,0.70":4,"entertainment|0.05,0.55":7,"mobilethinkpad|0.70,0.3":7,"smartoffice|0.10,0.25":4,"smartpc|0.40,0.45":10,"smarthome|0.00,0.50":3,"smarthome|0.65,0.55":2,"entertainment|0.65,0.85":13,"entertainment|0.05,0.50":10,"entertainment|0.00,0.90":7,"gaming|0.45,0.35":107,"mobilethinkpad|0.7,0.25":11,"entertainment|0.00,0.80":7,"smartoffice|0.40,0.20":36,"entertainment|0.80,0.40":15,"gaming|0.6,0.70":1,"smarthome|0.60,0.55":3,"entertainment|0.9,0.35":11,"smarthome|0.60,0.60":2,"smarthome|0.9,0.80":2,"smarthome|0.60,0.5":2,"smarthome|0.65,0.60":2,"smarthome|0.60,0.45":2,"entertainment|0.55,0.4":19,"workstation|0.20,0.70":6,"smartpc|0.45,0.40":15,"workstation|0.20,0.65":8,"smartoffice|0.05,0.65":8,"smartoffice|0.5,0.20":9,"entertainment|0.6,0.25":26,"mobilethinkpad|0.7,0.30":13,"smartoffice|0.5,0.2":1,"smarthome|0.90,0.80":1,"entertainment|0.15,0.50":11,"workstation|0.25,0.70":5,"mobilethinkpad|0.85,0.3":1,"smarthome|0.9,0.85":1,"entertainment|0.2,0.65":1,"gaming|0.90,0.4":10,"gaming|0.00,0.70":9,"smarthome|0.50,0.8":12,"entertainment|0.4,0.55":2,"workstation|0.60,0.40":7,"mobilethinkpad|0.7,0.3":3,"smartpc|0.45,0.5":1,"entertainment|0.15,0.55":14,"mobilethinkpad|0.80,0.3":4,"smarthome|0.90,0.75":4,"gaming|0.70,0.3":1,"gaming|0.15,0.45":22,"gaming|0.35,0.40":27,"gaming|0.70,0.30":7,"smartpc|0.50,0.55":7,"school|0.25,0.35":24,"school|0.10,0.40":6,"smartoffice|0.15,0.80":10,"smarthome|0.50,0.85":62,"gaming|0.2,0.40":6,"school|0.35,0.45":5,"audiovideo|0.1,0.50":4,"school|0.40,0.40":16,"mobilethinkpad|0.70,0.25":18,"smarthome|0.9,0.55":4,"entertainment|0.35,0.45":4,"audiovideo|0.3,0.35":9,"smartoffice|0.15,0.8":4,"commercialiot|0.40,0.55":10,"audiovideo|0.1,0.45":4,"smartoffice|0.70,0.55":15,"audiovideo|0.3,0.40":5,"gaming|0.45,0.50":12,"smartoffice|0.25,0.50":16,"audiovideo|0.55,0.65":10,"audiovideo|0.80,0.50":7,"audiovideo|0.3,0.4":2,"workstation|0.6,0.20":2,"commercialiot|0.3,0.35":3,"workstation|0.2,0.8":2,"smartoffice|0.75,0.75":6,"gaming|0.80,0.55":17,"gaming|0.6,0.75":1,"gaming|0.50,0.45":18,"workstation|0.20,0.60":2,"mobilethinkpad|0.10,0.40":11,"smartoffice|0.85,0.7":2,"school|0.20,0.35":26,"gaming|0.80,0.50":27,"gaming|0.8,0.55":9,"smartoffice|0.9,0.65":2,"commercialiot|0.25,0.20":7,"workstation|0.50,0.30":18,"school|0.20,0.30":46,"smarthome|0.4,0.35":3,"audiovideo|0.30,0.40":25,"gaming|0.75,0.7":2,"gaming|0.45,0.70":3,"commercialiot|0.2,0.35":5,"smarthome|0.60,0.65":4,"gaming|0.40,0.45":13,"workstation|0.95,0.4":6,"smarthome|0.85,0.55":12,"workstation|0.9,0.40":5,"smarthome|0.50,0.75":16,"smartoffice|0.95,0.3":2,"smarthome|0.45,0.80":2,"smarthome|0.80,0.60":6,"audiovideo|0.30,0.60":9,"gaming|0.85,0.85":1,"workstation|0.50,0.45":3,"school|0.35,0.35":35,"gaming|0.1,0.4":6,"school|0.30,0.30":23,"smarthome|0.6,0.65":2,"smarthome|0.8,0.50":1,"smarthome|0.80,0.70":7,"gaming|0.1,0.35":4,"smartoffice|0.55,0.35":15,"smarthome|0.80,0.75":5,"smartpc|0.5,0.45":1,"entertainment|0.65,0.7":3,"gaming|0.35,0.75":49,"smartpc|0.5,0.50":1,"school|0.2,0.30":10,"entertainment|0.60,0.65":3,"gaming|0.50,0.85":2,"gaming|0.25,0.50":4,"workstation|0.95,0.45":23,"smartoffice|0.15,0.85":5,"smartpc|0.50,0.45":4,"school|0.05,0.5":3,"gaming|0.20,0.50":12,"workstation|0.9,0.35":6,"workstation|0.20,0.45":7,"smartoffice|0.90,0.60":13,"smartpc|0.65,0.45":2,"smarthome|0.8,0.65":4,"smarthome|0.40,0.75":1,"smarthome|0.80,0.8":1,"gaming|0.85,0.65":24,"smartpc|0.90,0.45":8,"smarthome|0.45,0.8":2,"smarthome|0.8,0.75":2,"smarthome|0.45,0.75":8,"gaming|0.9,0.60":1,"gaming|0.1,0.60":5,"smarthome|0.85,0.65":5,"gaming|0.60,0.55":17,"workstation|0.40,0.60":4,"smartoffice|0.2,0.85":3,"smarthome|0.85,0.60":4,"smartpc|0.85,0.40":17,"smarthome|0.90,0.6":2,"audiovideo|0.4,0.60":5,"smartoffice|0.2,0.8":2,"audiovideo|0.05,0.50":2,"audiovideo|0.10,0.45":2,"gaming|0.6,0.85":1,"mobilethinkpad|0.00,0.55":7,"smartpc|0.85,0.45":33,"smartoffice|0.00,0.60":1,"smartoffice|0.2,0.70":1,"commercialiot|0.85,0.65":3,"school|0.70,0.60":5,"commercialiot|0.50,0.40":8,"audiovideo|0.4,0.55":1,"mobilethinkpad|0.00,0.50":3,"commercialiot|0.55,0.4":10,"audiovideo|0.60,0.65":2,"audiovideo|0.00,0.6":1,"workstation|0.25,0.60":10,"commercialiot|0.9,0.50":1,"school|0.65,0.30":31,"audiovideo|1,0.30":9,"commercialiot|0.60,0.5":4,"school|0.70,0.7":1,"smarthome|0.95,0.50":7,"entertainment|0.05,0.7":1,"gaming|0.30,0.70":1,"school|0.40,0.60":3,"entertainment|0.00,0.75":8,"smartoffice|0.50,0.55":4,"smartoffice|0.65,0.80":5,"commercialiot|0.35,0.50":9,"smarthome|0.95,0.55":10,"entertainment|0.25,0.40":52,"entertainment|0.00,0.70":2,"smartoffice|0.6,0.45":5,"school|0.00,0.40":2,"smarthome|0.95,0.60":15,"smarthome|0.35,0.40":8,"entertainment|0.05,0.70":5,"gaming|0.95,0.6":3,"smartoffice|0.60,0.45":4,"smarthome|0.5,0.75":1,"smarthome|0.95,0.6":2,"gaming|0.15,0.8":1,"commercialiot|0.90,0.40":12,"audiovideo|0.80,0.4":12,"audiovideo|0.05,0.6":2,"gaming|0.10,0.5":2,"smartoffice|0.55,0.20":33,"smartoffice|0.60,0.50":5,"commercialiot|0.8,0.40":5,"smarthome|0.95,0.70":3,"smarthome|0.95,0.75":2,"entertainment|0.00,0.65":5,"audiovideo|0.45,0.7":5,"smartoffice|0.60,0.5":1,"school|0.30,0.60":5,"smarthome|0.80,0.7":1,"smarthome|0.95,0.65":21,"audiovideo|0.00,0.50":1,"workstation|0.35,0.75":2,"smartoffice|0.70,0.50":4,"smartoffice|0.65,0.5":1,"school|0.65,0.50":6,"audiovideo|0.40,0.70":4,"workstation|0.30,0.65":18,"smartoffice|0.9,0.70":1,"commercialiot|0.40,0.50":9,"school|0.45,0.50":3,"entertainment|0.4,0.50":2,"workstation|0.05,0.75":6,"smartoffice|0.7,0.55":7,"smartoffice|0.65,0.40":14,"gaming|0.35,0.85":6,"commercialiot|0.90,0.55":3,"audiovideo|0.40,0.8":1,"gaming|0.40,0.7":2,"smartoffice|0.65,0.45":10,"smartoffice|0.7,0.50":3,"commercialiot|0.85,0.60":3,"gaming|0.75,0.80":4,"gaming|0.6,0.40":17,"workstation|0.00,0.65":6,"entertainment|0.10,0.45":10,"gaming|0.40,0.60":5,"workstation|0.35,0.7":2,"smartpc|0.80,0.50":8,"gaming|0.70,0.7":4,"gaming|0.30,0.55":5,"smartpc|0.75,0.55":6,"commercialiot|0.20,0.80":1,"commercialiot|0.30,0.45":18,"audiovideo|0.35,0.65":10,"gaming|0.90,0.50":9,"smartoffice|0.65,0.55":20,"audiovideo|0.10,0.55":1,"commercialiot|0.1,0.7":1,"smarthome|0.70,0.75":1,"audiovideo|0.6,0.55":3,"audiovideo|0.15,0.3":14,"commercialiot|0.15,0.50":11,"commercialiot|0.55,0.70":1,"smartoffice|0.65,0.50":10,"smartpc|0.85,0.55":25,"commercialiot|0.10,0.55":6,"commercialiot|0.50,0.70":1,"entertainment|0.6,0.35":15,"audiovideo|0.70,0.5":2,"smartoffice|0.70,0.60":6,"smartpc|0.80,0.60":12,"commercialiot|0.10,0.50":4,"smartoffice|0.75,0.55":9,"smartpc|0.80,0.55":14,"entertainment|0.20,0.40":30,"audiovideo|0.80,0.65":6,"audiovideo|0.4,0.6":1,"commercialiot|0.1,0.55":3,"audiovideo|0.75,0.5":2,"audiovideo|0.90,0.50":11,"gaming|0.30,0.65":20,"commercialiot|0.05,0.50":16,"entertainment|0.60,0.4":17,"smartoffice|0.65,0.65":12,"audiovideo|0.95,0.50":6,"audiovideo|0.00,0.80":1,"audiovideo|0.95,0.4":3,"mobilethinkpad|0.85,0.45":38,"mobilethinkpad|0.90,0.70":5,"mobilethinkpad|0.60,0.35":36,"commercialiot|0.00,0.55":8,"mobilethinkpad|0.35,0.30":20,"smartoffice|0.70,0.6":4,"commercialiot|0.05,0.5":4,"audiovideo|0.20,0.7":1,"workstation|0.05,0.7":7,"commercialiot|0.00,0.45":7,"audiovideo|0.20,0.75":7,"audiovideo|0.35,0.55":13,"smartoffice|0.10,0.85":1,"smartpc|0.85,0.60":3,"audiovideo|0.35,0.5":7,"audiovideo|0.25,0.80":2,"smartoffice|0.10,0.8":2,"commercialiot|0.00,0.5":2,"commercialiot|0.6,0.35":24,"smartoffice|0.10,0.75":4,"audiovideo|0.55,0.50":16,"gaming|0.80,0.90":1,"smartoffice|0.80,0.70":9,"smartpc|0.85,0.50":8,"audiovideo|0.85,0.65":5,"audiovideo|0.25,0.75":12,"smartoffice|0.65,0.6":5,"audiovideo|0.25,0.8":1,"audiovideo|0.85,0.45":12,"gaming|0.75,0.85":5,"entertainment|0.10,0.90":4,"audiovideo|0.90,0.45":9,"mobilethinkpad|0.90,0.3":4,"gaming|0.10,0.7":5,"audiovideo|0.75,0.70":4,"commercialiot|0.10,0.75":2,"audiovideo|0.35,0.60":3,"smartoffice|0.10,0.4":9,"smarthome|0.75,0.70":1,"audiovideo|0.40,0.30":11,"smartoffice|0.70,0.65":6,"commercialiot|0.65,0.3":13,"audiovideo|0.75,0.8":3,"smartpc|0.15,0.65":3,"commercialiot|0.40,0.30":23,"commercialiot|0.00,0.6":1,"entertainment|0.20,0.45":13,"audiovideo|0.20,0.85":2,"audiovideo|0.4,0.30":2,"commercialiot|0.35,0.3":12,"commercialiot|0.05,0.45":9,"audiovideo|0.15,0.25":29,"gaming|0.60,0.30":17,"school|0.50,0.40":4,"audiovideo|0.75,0.85":4,"gaming|0.75,0.70":14,"gaming|0.35,0.80":8,"audiovideo|0.80,0.25":8,"workstation|0.55,0.40":8,"audiovideo|0.75,0.25":19,"gaming|0.00,0.35":13,"workstation|0.60,0.4":2,"audiovideo|0.40,0.25":4,"audiovideo|0.25,0.60":3,"workstation|0.20,0.75":5,"workstation|0.25,0.55":5,"workstation|0.5,0.30":12,"commercialiot|0.25,0.3":24,"gaming|0.7,0.45":14,"gaming|0.55,0.55":119,"audiovideo|0,0.75":1,"gaming|0.85,0.70":14,"gaming|0.40,0.25":12,"workstation|0.75,0.4":8,"commercialiot|0.15,0.40":10,"mobilethinkpad|0.00,0.65":6,"mobilethinkpad|0.90,0.75":3,"smarthome|0.85,0.70":1,"entertainment|0.30,0.4":12,"audiovideo|0.4,0.4":4,"audiovideo|0.05,0.80":5,"smarthome|0.55,0.85":20,"gaming|0.20,0.6":1,"smartoffice|0.90,0.35":48,"school|0.4,0.35":10,"gaming|0.50,0.80":1,"smartoffice|0.9,0.35":8,"smartpc|0.80,0.65":19,"smartpc|0.8,0.65":7,"smarthome|0.40,0.65":1,"smarthome|0.9,0.60":7,"smarthome|0.55,0.8":32,"entertainment|0.9,0.40":25,"smartpc|0.80,0.70":9,"smarthome|0.20,0.55":7,"gaming|0.05,0.25":9,"smartpc|0.8,0.85":3,"audiovideo|0.50,0.60":7,"gaming|0.85,0.60":14,"smarthome|0.55,0.80":26,"entertainment|0.65,0.4":11,"audiovideo|0.10,0.70":5,"smartpc|0.80,0.7":4,"audiovideo|0.15,0.75":2,"gaming|0.8,0.65":3,"gaming|0.45,0.65":18,"smartoffice|0.90,0.50":5,"smartpc|0.55,0.7":3,"gaming|0.45,0.7":2,"gaming|0.20,0.70":4,"gaming|0.65,0.8":1,"gaming|0.45,0.60":3,"gaming|0.35,0.50":24,"workstation|0.30,0.4":5,"smartoffice|0.9,0.40":7,"smartpc|0.8,0.60":3,"entertainment|0.55,0.50":1,"gaming|0.30,0.60":8,"gaming|0.40,0.6":2,"smarthome|0.50,0.70":15,"entertainment|0.80,0.25":6,"entertainment|0.70,0.50":4,"workstation|0.4,0.70":1,"smarthome|0.00,0.6":1,"mobilethinkpad|0.85,0.70":17,"smartpc|0.10,0.55":9,"smarthome|0.10,0.45":7,"entertainment|0.85,0.50":9,"workstation|0.40,0.30":16,"smarthome|0.65,0.50":9,"mobilethinkpad|0.25,0.40":3,"mobilethinkpad|0.85,0.75":16,"commercialiot|0.25,0.65":4,"smarthome|0.95,0.5":1,"entertainment|0.15,0.5":4,"smartpc|0.85,0.70":1,"commercialiot|0.50,0.30":49,"smarthome|0.40,0.55":1,"smartpc|0.75,0.7":8,"smartpc|0.75,0.70":12,"commercialiot|0.1,0.60":2,"school|0.40,0.6":1,"entertainment|0.35,0.30":48,"gaming|0.9,0.25":6,"smartpc|0.75,0.65":48,"school|0.30,0.50":3,"smarthome|0.5,0.80":1,"gaming|0.95,0.3":16,"school|0.10,0.60":4,"smartoffice|0.35,0.50":4,"entertainment|0.35,0.35":18,"smartpc|0.80,0.75":5,"commercialiot|0.15,0.80":3,"mobilethinkpad|0.70,0.65":10,"smarthome|0.40,0.45":5,"smarthome|0.80,0.50":3,"smartoffice|0.15,0.70":1,"entertainment|0.70,0.8":2,"entertainment|0.10,0.6":2,"audiovideo|0.35,0.90":1,"workstation|0.45,0.70":25,"smartoffice|0.25,0.45":11,"audiovideo|0.75,0.75":3,"audiovideo|0.45,0.80":2,"audiovideo|0.3,0.80":1,"audiovideo|0.75,0.65":8,"mobilethinkpad|0.3,0.25":6,"mobilethinkpad|0.75,0.55":9,"smartoffice|0.90,0.6":1,"smartpc|0.40,0.60":5,"smartpc|0.15,0.85":1,"smarthome|0.75,0.85":2,"mobilethinkpad|0.8,0.65":2,"entertainment|0.45,0.4":16,"smartoffice|0.9,0.60":1,"smartpc|0.45,0.55":6,"mobilethinkpad|0.20,0.4":2,"smartpc|0.3,0.65":1,"smartpc|0.95,0.30":23,"mobilethinkpad|0.85,0.7":6,"smartpc|0.40,0.55":11,"smartpc|0.60,0.50":1,"entertainment|0.70,0.80":11,"entertainment|0.15,0.70":3,"workstation|0.15,0.40":10,"smarthome|0.55,0.55":4,"entertainment|0.30,0.55":7,"gaming|0.00,0.40":15,"mobilethinkpad|0.1,0.35":4,"smartpc|0.75,0.75":15,"mobilethinkpad|0.85,0.4":8,"entertainment|0.3,0.50":11,"workstation|0.25,0.75":1,"smarthome|0.70,0.80":1,"workstation|0.15,0.60":6,"smartoffice|0.25,0.7":4,"workstation|0.00,0.8":3,"workstation|0.25,0.65":16,"school|0.25,0.40":12,"workstation|0.00,0.80":1,"workstation|0.30,0.55":11,"workstation|0.25,0.7":2,"mobilethinkpad|0.3,0.20":2,"smartpc|0.8,0.70":6,"entertainment|0.85,0.8":2,"mobilethinkpad|0.25,0.25":29,"commercialiot|0.05,0.85":13,"commercialiot|0.50,0.35":36,"smarthome|0.5,0.7":1,"smartoffice|0.65,0.7":1,"smartpc|0.8,0.7":1,"workstation|0.95,0.6":2,"workstation|0.15,0.6":3,"workstation|0.75,0.40":17,"workstation|0.40,0.50":9,"smartpc|0.8,0.8":2,"smarthome|0.75,0.60":3,"mobilethinkpad|0.15,0.4":12,"smartoffice|0.95,0.70":12,"smartpc|0.80,0.85":1,"commercialiot|0.6,0.25":10,"workstation|0.35,0.40":9,"workstation|0.15,0.50":7,"audiovideo|0.7,0.30":7,"workstation|0.75,0.25":36,"mobilethinkpad|0.35,0.40":4,"smartpc|0.8,0.80":2,"smartpc|0.25,0.30":8,"mobilethinkpad|0.30,0.45":4,"audiovideo|0.45,0.30":19,"smartoffice|0.90,0.45":2,"smartpc|0.35,0.60":2,"smartpc|0.85,0.30":42,"smartoffice|0.60,0.35":13,"mobilethinkpad|0.85,0.8":4,"smartpc|0.75,0.35":20,"workstation|0.10,0.80":1,"commercialiot|0.25,0.45":7,"commercialiot|0.85,0.55":2,"mobilethinkpad|0.25,0.45":12,"mobilethinkpad|0.35,0.6":1,"commercialiot|0.4,0.30":11,"mobilethinkpad|0.30,0.85":1,"mobilethinkpad|0.85,0.50":21,"mobilethinkpad|0.4,0.50":2,"smartoffice|0.75,0.80":1,"workstation|0.00,0.60":4,"workstation|0.20,0.80":3,"mobilethinkpad|0.40,0.35":26,"workstation|0.65,0.85":4,"mobilethinkpad|0.80,0.80":4,"audiovideo|0.35,0.3":6,"smartpc|0.75,0.80":2,"audiovideo|0.8,0.3":1,"gaming|0.90,0.20":2,"entertainment|0.30,0.60":9,"workstation|0.20,0.8":1,"mobilethinkpad|0.80,0.85":2,"commercialiot|0.6,0.3":7,"mobilethinkpad|0.80,0.8":4,"commercialiot|0.90,0.65":4,"smartpc|0.70,0.75":1,"commercialiot|0.55,0.45":29,"audiovideo|0.9,0.70":3,"smartpc|0.70,0.30":8,"smartoffice|0.6,0.55":2,"entertainment|0.95,0.7":1,"smartoffice|0.5,0.60":1,"smartoffice|0.6,0.65":3,"commercialiot|0.45,0.60":10,"commercialiot|0.15,0.25":85,"commercialiot|0.75,0.50":1,"smartoffice|0.45,0.60":4,"smartoffice|0.60,0.60":3,"commercialiot|0.45,0.65":5,"workstation|0.00,0.7":2,"smartoffice|0.45,0.7":3,"smartpc|0.65,0.55":5,"gaming|0.25,0.55":14,"workstation|0.95,0.35":17,"mobilethinkpad|0.1,0.6":2,"entertainment|0.05,0.8":5,"smartoffice|0.45,0.65":2,"smartpc|0.6,0.6":1,"commercialiot|0.2,0.25":29,"smartoffice|0.6,0.60":4,"smartpc|0.70,0.60":15,"commercialiot|0.35,0.25":15,"gaming|0.15,0.80":3,"mobilethinkpad|0.15,0.20":6,"commercialiot|0.40,0.25":4,"audiovideo|0.00,0.40":14,"gaming|0.55,0.70":20,"mobilethinkpad|0.80,0.55":10,"smartpc|0.4,0.55":2,"audiovideo|0.50,0.50":8,"workstation|0.10,0.65":1,"mobilethinkpad|0.10,0.65":8,"gaming|0.9,0.20":2,"mobilethinkpad|0.15,0.25":6,"mobilethinkpad|0.80,0.6":3,"commercialiot|0.4,0.25":1,"commercialiot|0.70,0.40":14,"smartoffice|0.20,0.5":4,"commercialiot|0.1,0.4":6,"entertainment|0.65,0.90":6,"entertainment|0.40,0.6":2,"audiovideo|0.45,0.55":11,"smartpc|0.4,0.6":1,"gaming|0.85,0.3":10,"school|0.35,0.4":6,"gaming|0.65,0.7":3,"smartoffice|0.15,0.25":2,"commercialiot|0.05,0.4":9,"audiovideo|0.55,0.30":14,"audiovideo|0.45,0.5":2,"commercialiot|0.30,0.35":20,"entertainment|0.60,0.25":45,"audiovideo|0.75,0.6":1,"gaming|0.25,0.6":1,"school|0.90,0.45":5,"entertainment|0.65,0.30":182,"audiovideo|0.70,0.20":8,"gaming|0.10,0.45":10,"gaming|0.15,0.6":1,"smartpc|0.70,0.65":14,"smartoffice|0.20,0.25":1,"smarthome|0.05,0.5":3,"workstation|0.90,0.65":10,"workstation|0.40,0.85":3,"smartoffice|0.95,0.75":5,"commercialiot|0.1,0.40":7,"workstation|0.4,0.60":4,"smartpc|0.25,0.5":6,"audiovideo|0.60,0.5":3,"smartoffice|0.15,0.60":8,"entertainment|0.90,0.50":4,"mobilethinkpad|0.1,0.70":1,"smartpc|0.25,0.45":22,"commercialiot|0.55,0.5":3,"smartoffice|0.2,0.30":3,"smartoffice|0.85,0.65":8,"workstation|0.15,0.5":2,"gaming|0.20,0.75":9,"workstation|0.10,0.50":5,"commercialiot|0.10,0.4":2,"commercialiot|0.7,0.40":2,"mobilethinkpad|0.1,0.65":4,"school|0.85,0.40":9,"audiovideo|0.55,0.4":3,"mobilethinkpad|0.85,0.55":17,"smartoffice|0.95,0.45":10,"smartoffice|0.25,0.55":8,"smarthome|0.3,0.3":1,"smartoffice|0.45,0.50":8,"commercialiot|0.7,0.45":1,"smarthome|0.50,0.20":4,"gaming|0.75,0.90":2,"mobilethinkpad|0.7,0.65":1,"school|0.4,0.30":9,"mobilethinkpad|0.25,0.4":10,"smartpc|0.50,0.60":6,"workstation|0.45,0.3":3,"audiovideo|0.6,0.4":3,"mobilethinkpad|0.50,0.25":32,"smartoffice|0.70,0.70":17,"audiovideo|0.7,0.35":13,"commercialiot|0.30,0.25":16,"commercialiot|0.3,0.25":9,"gaming|0.1,0.55":8,"workstation|0.65,0.25":9,"entertainment|0.55,0.85":8,"audiovideo|0.10,0.4":4,"mobilethinkpad|0.20,0.25":22,"commercialiot|0.25,0.25":72,"gaming|0.2,0.75":1,"mobilethinkpad|0.25,0.35":18,"smartpc|0.40,0.70":5,"mobilethinkpad|0.75,0.65":10,"smartpc|0.35,0.65":7,"audiovideo|0.50,0.75":3,"mobilethinkpad|0.75,0.50":5,"school|0.10,0.35":20,"mobilethinkpad|0.75,0.60":26,"mobilethinkpad|0.4,0.35":7,"smartpc|0.30,0.55":5,"school|0.60,0.80":2,"smartoffice|0.25,0.90":7,"commercialiot|0.75,0.3":23,"school|0.60,0.55":3,"gaming|0.85,0.20":2,"smartoffice|0.80,0.7":2,"commercialiot|0.3,0.3":1,"commercialiot|0.80,0.3":2,"school|0.25,0.30":21,"commercialiot|0.30,0.3":9,"audiovideo|0.60,0.7":1,"school|0.15,0.30":67,"school|0.00,0.35":17,"gaming|0.5,0.55":1,"school|0.40,0.3":7,"gaming|0.70,0.4":24,"school|0.7,0.65":2,"entertainment|0.40,0.85":5,"entertainment|0.45,0.80":2,"audiovideo|0.8,0.7":1,"smartoffice|0.10,0.80":1,"mobilethinkpad|0.55,0.3":4,"school|0.35,0.25":21,"entertainment|0.5,0.75":1,"audiovideo|0.65,0.60":3,"gaming|0.70,0.5":11,"mobilethinkpad|0.55,0.40":4,"commercialiot|0.75,0.4":5,"school|0.00,0.25":6,"mobilethinkpad|0.75,0.75":4,"smartpc|0.55,0.80":1,"smartpc|0.50,0.50":2,"audiovideo|0.80,0.60":1,"audiovideo|0.40,0.75":3,"entertainment|0.4,0.8":5,"entertainment|0.00,0.8":3,"entertainment|0.10,0.60":3,"entertainment|0.35,0.75":4,"audiovideo|0.35,0.75":1,"mobilethinkpad|0.90,0.60":6,"gaming|0.1,0.85":1,"workstation|0.00,0.55":7,"smartoffice|0.75,0.25":18,"school|0.2,0.35":8,"smarthome|0.15,0.40":14,"smartpc|0.70,0.70":1,"gaming|0.50,0.8":1,"smartoffice|0.10,0.30":14,"gaming|0.40,0.50":64,"gaming|0.2,0.45":1,"smartoffice|0.25,0.65":6,"audiovideo|0.75,0.80":3,"smartoffice|0.35,0.45":10,"commercialiot|0.70,0.4":3,"workstation|0.65,0.60":3,"smartpc|0.05,0.75":3,"workstation|0.70,0.6":4,"gaming|0.2,0.4":36,"mobilethinkpad|0.1,0.55":3,"smartpc|0.70,0.6":3,"school|0.9,0.30":7,"smartoffice|0.3,0.30":4,"audiovideo|0.25,0.6":1,"gaming|0.70,0.85":4,"workstation|0.90,0.55":14,"workstation|0.70,0.60":6,"smartoffice|0.60,0.3":11,"school|0.75,0.30":40,"smarthome|0.9,0.35":8,"gaming|0.70,0.50":44,"workstation|0.65,0.5":2,"smartoffice|0.70,0.30":14,"audiovideo|0.20,0.60":3,"school|0.80,0.35":64,"entertainment|0.35,0.6":1,"gaming|0.10,0.55":7,"smartoffice|0.6,0.25":22,"audiovideo|0.8,0.55":2,"audiovideo|0.75,0.50":14,"smartoffice|0.8,0.35":4,"smartpc|0.1,0.65":1,"smartpc|0.25,0.55":19,"commercialiot|0.30,0.65":9,"workstation|0.8,0.45":10,"audiovideo|0.25,0.45":8,"smartoffice|0.6,0.20":6,"smartpc|0.45,0.50":5,"school|0.1,0.35":3,"audiovideo|0.55,0.6":3,"smartpc|0.75,0.40":10,"school|0.20,0.25":24,"gaming|0.1,0.40":2,"smartpc|0.9,0.35":4,"gaming|0.40,0.55":23,"smartpc|0.90,0.40":6,"gaming|0.25,0.60":7,"school|0.25,0.25":31,"smartoffice|0.05,0.70":7,"smartpc|0.75,0.4":5,"gaming|0.1,0.8":1,"school|0.2,0.3":3,"entertainment|0.55,0.90":1,"smartpc|0.7,0.40":2,"entertainment|0.35,0.60":3,"smartpc|0.70,0.4":3,"workstation|0.9,0.4":7,"commercialiot|0.8,0.35":9,"gaming|1,0.20":1,"gaming|0.2,0.70":2,"smartpc|0.65,0.40":11,"gaming|0.95,0.20":1,"mobilethinkpad|0.95,0.60":4,"smartpc|0.70,0.45":3,"school|0.55,0.35":49,"mobilethinkpad|0.65,0.5":3,"smartoffice|0.35,0.80":1,"entertainment|0.15,0.3":14,"gaming|0.3,0.55":3,"workstation|0.95,0.40":3,"workstation|0.60,0.45":1,"smartoffice|0.35,0.20":15,"smarthome|0.30,0.50":5,"entertainment|0.15,0.25":24,"audiovideo|0.10,0.30":38,"gaming|0.60,0.5":3,"mobilethinkpad|0.10,0.30":36,"school|0.85,0.7":2,"school|0.55,0.50":3,"entertainment|0.00,0.60":4,"gaming|0.4,0.65":2,"commercialiot|0.95,0.50":5,"commercialiot|0.45,0.70":6,"school|0.05,0.55":12,"mobilethinkpad|0.95,0.85":1,"audiovideo|0.1,0.25":4,"school|0.05,0.50":6,"gaming|0.30,0.50":2,"gaming|0.7,0.4":3,"smartoffice|0.60,0.30":18,"mobilethinkpad|0.15,0.55":5,"mobilethinkpad|0.3,0.30":15,"audiovideo|0.40,0.7":2,"audiovideo|0.8,0.40":9,"workstation|0.30,0.35":14,"mobilethinkpad|0.6,0.25":3,"mobilethinkpad|0.00,0.30":5,"mobilethinkpad|0.25,0.3":7,"gaming|0.10,0.8":1,"gaming|0.4,0.45":1,"mobilethinkpad|0.55,0.20":30,"audiovideo|0.70,0.3":4,"audiovideo|0.70,0.25":14,"smartoffice|0.05,0.75":4,"audiovideo|0.75,0.3":4,"smartoffice|0.10,0.55":5,"gaming|0.35,0.25":147,"mobilethinkpad|0.3,0.35":6,"smartoffice|0.40,0.85":1,"gaming|0.35,0.3":17,"gaming|0.10,0.25":8,"smartoffice|0.1,0.45":7,"smartoffice|0.25,0.40":11,"smartoffice|0.10,0.45":19,"smartpc|0.90,0.25":29,"commercialiot|0.4,0.45":11,"gaming|0.1,0.25":25,"smartoffice|0.00,0.70":2,"audiovideo|1,0.35":3,"smartoffice|0.05,0.40":52,"smartpc|0.6,0.40":1,"commercialiot|0.25,0.50":8,"commercialiot|0.55,0.55":8,"entertainment|0,0.35":3,"gaming|0.85,0.6":1,"commercialiot|0.50,0.55":7,"audiovideo|0.8,0.45":9,"gaming|0.35,0.65":3,"smartoffice|0.20,0.4":7,"gaming|0.30,0.6":4,"gaming|0.55,0.60":9,"gaming|0.45,0.6":2,"smartoffice|0.05,0.4":26,"gaming|0.4,0.50":19,"smartoffice|0.00,0.40":28,"smartpc|0.05,0.25":1,"audiovideo|0,0.25":4,"gaming|0.2,0.50":2,"gaming|0.70,0.65":13,"entertainment|0,0.30":3,"smartpc|0.25,0.20":2,"audiovideo|0.75,0.45":46,"commercialiot|0.65,0.25":42,"workstation|0.10,0.7":1,"smartoffice|0.35,0.6":1,"audiovideo|0.75,0.35":56,"mobilethinkpad|0.20,0.3":14,"entertainment|0.35,0.80":1,"commercialiot|0.60,0.25":19,"workstation|0.7,0.55":3,"smartpc|0.85,0.3":11,"smarthome|0.15,0.45":7,"audiovideo|0.75,0.4":33,"audiovideo|0.20,0.90":1,"mobilethinkpad|0.10,0.70":3,"smartpc|0.70,0.40":8,"audiovideo|0.15,0.55":7,"smartpc|0.80,0.3":5,"commercialiot|0.60,0.3":10,"entertainment|0.50,0.90":1,"smartpc|0.50,0.4":4,"smartpc|0.5,0.35":4,"commercialiot|0.70,0.3":12,"school|0.65,0.4":3,"entertainment|0.75,0.95":1,"school|0.70,0.50":4,"school|0.35,0.55":6,"smarthome|0.00,0.5":2,"smartpc|0.3,0.50":6,"gaming|0.60,0.4":35,"smartpc|0.8,0.30":3,"commercialiot|0.25,0.55":6,"commercialiot|0.00,0.7":1,"mobilethinkpad|0.65,0.70":5,"smarthome|0.10,0.40":9,"audiovideo|0.25,0.4":7,"smartpc|0.90,0.3":6,"workstation|0.65,0.65":1,"workstation|0.45,0.45":8,"commercialiot|0.4,0.70":3,"mobilethinkpad|0.05,0.60":4,"smartpc|0.9,0.25":7,"smarthome|0.4,0.20":121,"workstation|0.80,0.5":4,"smarthome|0.40,0.20":67,"mobilethinkpad|0.95,0.5":5,"smarthome|0.6,0.25":7,"workstation|0.15,0.4":5,"commercialiot|0.70,0.55":8,"school|0.6,0.35":5,"smarthome|0.60,0.20":28,"entertainment|0.3,0.25":1,"school|0.6,0.30":20,"smarthome|0.00,0.4":6,"workstation|0.00,0.5":2,"smarthome|0.45,0.20":4,"smarthome|0.05,0.4":8,"smartoffice|0.55,0.2":1,"smartpc|0.3,0.60":1,"mobilethinkpad|0.75,0.40":12,"commercialiot|0.55,0.40":10,"smarthome|0.55,0.25":11,"smarthome|0.30,0.30":9,"mobilethinkpad|0.65,0.40":7,"smartoffice|0.55,0.60":3,"workstation|0.2,0.35":2,"mobilethinkpad|0.35,0.4":1,"mobilethinkpad|0.95,0.45":13,"school|0.1,0.45":2,"mobilethinkpad|0.35,0.45":1,"smarthome|0.40,0.2":1,"entertainment|0.65,0.8":3,"mobilethinkpad|0.95,0.55":15,"smartoffice|0.85,0.55":7,"smartoffice|0.55,0.65":4,"smartoffice|0.10,0.50":11,"smartoffice|0.65,0.35":14,"commercialiot|0.50,0.25":21,"school|0.95,0.35":2,"commercialiot|0.20,0.7":2,"commercialiot|0.55,0.7":1,"school|0.90,0.35":53,"commercialiot|0.55,0.80":1,"entertainment|0.9,0.30":35,"entertainment|0.55,0.80":2,"audiovideo|0.10,0.25":13,"mobilethinkpad|0.95,0.75":1,"commercialiot|0.1,0.65":5,"mobilethinkpad|0.1,0.60":2,"commercialiot|0.05,0.60":5,"audiovideo|0.6,0.40":3,"mobilethinkpad|0.85,0.80":2,"school|0,0.30":1,"mobilethinkpad|0.75,0.80":2,"smartpc|0.9,0.30":8,"mobilethinkpad|0.65,0.50":1,"commercialiot|0.00,0.60":2,"gaming|0.3,0.85":1,"smartpc|0.90,0.60":2,"audiovideo|0.30,0.30":27,"workstation|0.75,0.5":4,"smartpc|0.95,0.55":7,"audiovideo|0.30,0.25":3,"smartpc|0.95,0.70":7,"audiovideo|0.30,0.3":8,"commercialiot|0.3,0.4":2,"smarthome|0.90,0.25":15,"smartoffice|0.50,0.40":3,"smartoffice|0.10,0.7":1,"gaming|0.35,0.7":2,"smarthome|0.4,0.30":4,"gaming|0.35,0.55":13,"smartoffice|0.55,0.45":5,"smartpc|0.7,0.55":1,"mobilethinkpad|0.95,0.80":1,"smartoffice|0.4,0.35":6,"gaming|0.40,0.85":22,"smartpc|0.20,0.45":22,"gaming|0.05,0.90":1,"commercialiot|0.20,0.20":7,"commercialiot|0.50,0.45":23,"entertainment|0.50,0.40":15,"mobilethinkpad|0.55,0.45":2,"entertainment|0.30,0.70":4,"mobilethinkpad|0.50,0.65":3,"smartpc|0.35,0.50":8,"school|0.55,0.25":34,"audiovideo|0.60,0.50":13,"smartpc|0.30,0.50":16,"school|0.45,0.25":20,"gaming|0.00,0.85":1,"smartpc|0.65,0.50":5,"commercialiot|0.45,0.25":1,"entertainment|0.80,0.30":11,"smartoffice|0.3,0.25":1,"smartpc|0.20,0.50":20,"smarthome|0.9,0.40":3,"smartoffice|0.70,0.8":5,"smartpc|0.15,0.50":13,"school|0.55,0.30":65,"smarthome|0.85,0.45":6,"smarthome|0.4,0.25":27,"mobilethinkpad|0.75,0.25":18,"smarthome|0.25,0.5":1,"workstation|0.80,0.4":4,"workstation|0.20,0.5":2,"mobilethinkpad|0.80,0.25":3,"smartpc|0.40,0.50":16,"smarthome|0.15,0.6":2,"audiovideo|0.00,0.25":43,"mobilethinkpad|0.30,0.6":1,"audiovideo|0.00,0.3":22,"mobilethinkpad|0.70,0.20":12,"workstation|0.3,0.35":4,"workstation|0.8,0.50":7,"mobilethinkpad|0.75,0.20":20,"smartpc|0.65,0.65":19,"school|0.05,0.25":26,"school|0.00,0.65":2,"mobilethinkpad|0.20,0.20":1,"mobilethinkpad|0.8,0.25":6,"audiovideo|0.45,0.60":6,"workstation|0.65,0.50":5,"commercialiot|0.95,0.85":9,"commercialiot|0.9,0.30":40,"workstation|0.25,0.3":3,"workstation|0.75,0.55":6,"mobilethinkpad|0.65,0.8":1,"audiovideo|0.3,0.55":3,"commercialiot|0.95,0.8":6,"entertainment|0.90,0.3":3,"commercialiot|0.00,0.75":5,"workstation|0.7,0.40":2,"smartpc|0.65,0.60":5,"commercialiot|1,0.30":6,"school|0.15,0.55":5,"commercialiot|0.95,0.80":11,"school|0.10,0.50":5,"gaming|0.10,0.6":1,"workstation|0.55,0.90":3,"gaming|0.1,0.3":1,"mobilethinkpad|0.80,0.20":1,"smartoffice|0.25,0.95":2,"smartpc|0.65,0.70":4,"gaming|0.3,0.20":1,"mobilethinkpad|0.8,0.20":1,"school|0.6,0.40":2,"commercialiot|1,0.3":1,"gaming|0.75,0.5":16,"mobilethinkpad|0.90,0.50":12,"workstation|0.65,0.55":7,"workstation|0.50,0.90":5,"audiovideo|0.10,0.3":3,"gaming|0.8,0.50":8,"smartpc|0.3,0.3":1,"smarthome|0.10,0.55":3,"smartpc|0.7,0.7":1,"smartoffice|0.25,0.85":2,"smartoffice|0.5,0.35":3,"gaming|0.6,0.55":3,"gaming|0.1,0.30":12,"commercialiot|0.95,0.90":4,"entertainment|0.7,0.85":2,"entertainment|0.00,0.45":4,"gaming|0.8,0.45":4,"mobilethinkpad|0.30,0.55":2,"entertainment|0.45,0.50":5,"school|0.60,0.85":3,"school|0.80,0.70":5,"audiovideo|0.95,0.5":1,"workstation|0.50,0.85":10,"mobilethinkpad|0.30,0.50":2,"mobilethinkpad|0.65,0.20":10,"smarthome|0.25,0.50":5,"smartpc|0.7,0.60":2,"mobilethinkpad|0.45,0.3":14,"audiovideo|0.8,0.85":2,"mobilethinkpad|0.7,0.20":3,"entertainment|0.4,0.40":2,"entertainment|0.6,0.3":5,"entertainment|0.10,0.55":2,"smartoffice|0.05,0.3":3,"commercialiot|0.05,0.20":20,"smartoffice|0.90,0.3":5,"school|0.60,0.25":30,"school|0.65,0.25":45,"commercialiot|0.95,0.75":11,"entertainment|0.2,0.40":12,"gaming|0.55,0.6":8,"entertainment|0.75,0.90":2,"commercialiot|1,0.35":2,"gaming|0.65,0.5":13,"workstation|0.9,0.55":4,"smartoffice|0.5,0.3":1,"commercialiot|0.00,0.20":22,"gaming|0.20,0.4":1,"mobilethinkpad|0.00,0.60":3,"school|0.6,0.3":6,"gaming|0.00,0.7":1,"school|0.5,0.3":1,"mobilethinkpad|0.50,0.20":9,"school|0,0.75":1,"mobilethinkpad|0.5,0.20":3,"commercialiot|0.95,0.70":4,"school|0.00,0.8":2,"smarthome|0.8,0.4":2,"gaming|0.75,0.60":29,"workstation|0.9,0.50":4,"smartpc|0.60,0.20":4,"commercialiot|0.6,0.20":2,"school|0.8,0.35":21,"gaming|0.55,0.65":30,"mobilethinkpad|0.80,0.70":19,"commercialiot|0.95,0.3":18,"commercialiot|0.85,0.85":4,"smarthome|0.45,0.65":6,"smartoffice|0.80,0.85":1,"smartpc|0.50,0.6":3,"school|0.40,0.25":21,"workstation|0.8,0.40":3,"school|0.60,0.3":10,"gaming|0.80,0.75":4,"commercialiot|0.95,0.65":4,"workstation|0.45,0.75":24,"entertainment|0.2,0.35":38,"smartpc|0.25,0.25":7,"commercialiot|0.85,0.80":2,"commercialiot|0.85,0.8":1,"mobilethinkpad|0.4,0.30":7,"smartoffice|0.05,0.25":4,"gaming|0.60,0.6":1,"mobilethinkpad|0.5,0.25":7,"audiovideo|0.50,0.85":1,"audiovideo|0.2,0.45":2,"smartpc|0.55,0.60":3,"school|0.00,0.75":1,"smartoffice|0.15,0.30":29,"smartoffice|0.1,0.75":1,"school|0.1,0.55":1,"smartoffice|0.1,0.8":1,"school|0.15,0.45":5,"smartoffice|0.95,0.7":4,"school|0.60,0.35":31,"smarthome|0.5,0.55":1,"workstation|0.80,0.30":23,"entertainment|0.20,0.3":9,"workstation|0.95,0.60":5,"workstation|0.50,0.80":1,"school|0.40,0.90":1,"school|0.40,0.80":1,"smartpc|0.95,0.3":7,"smarthome|0.50,0.7":4,"smartpc|0.90,0.20":8,"commercialiot|0.2,0.3":1,"school|0.35,0.90":1,"gaming|0.7,0.70":3,"school|0.35,0.85":7,"smartoffice|0.1,0.50":3,"smartpc|0.55,0.65":5,"school|0.35,0.8":1,"smarthome|0.75,0.80":4,"school|0.35,0.75":3,"school|0.45,0.70":4,"smarthome|0.55,0.4":3,"workstation|0.00,0.50":5,"school|0.35,0.70":4,"commercialiot|0.9,0.65":1,"entertainment|0.65,0.80":5,"commercialiot|0.9,0.7":1,"smarthome|0.65,0.90":1,"entertainment|0.60,0.8":2,"audiovideo|0.95,0.20":1,"entertainment|0.60,0.80":3,"mobilethinkpad|0.25,0.60":3,"smartoffice|0.75,0.70":3,"school|0.20,0.4":2,"entertainment|0.00,0.3":13,"mobilethinkpad|0.7,0.35":4,"gaming|0.7,0.40":4,"smartpc|0.6,0.60":1,"commercialiot|0.15,0.3":8,"gaming|0.10,0.20":1,"mobilethinkpad|0.80,0.7":1,"gaming|0.00,0.4":1,"smartoffice|0.70,0.85":1,"mobilethinkpad|0.75,0.85":1,"smartoffice|0.70,0.75":10,"entertainment|0.25,0.5":45,"entertainment|0.4,0.45":3,"school|0.6,0.75":1,"audiovideo|0.70,0.80":1,"audiovideo|0.2,0.80":3,"smartoffice|0.65,0.75":11,"commercialiot|0.00,0.35":18,"commercialiot|0.7,0.35":6,"smartoffice|0.20,0.30":7,"audiovideo|0.70,0.55":4,"audiovideo|0.35,0.6":2,"mobilethinkpad|0.60,0.55":4,"smartpc|0.20,0.65":4,"smartpc|0.20,0.25":3,"entertainment|0.7,0.4":5,"workstation|0.1,0.95":1,"smartpc|0.85,0.85":2,"smartpc|0.35,0.3":2,"workstation|0.10,0.75":5,"commercialiot|0.2,0.85":1,"entertainment|0.35,0.85":1,"entertainment|0.65,0.75":2,"smartpc|0.95,0.65":2,"mobilethinkpad|0.4,0.3":1,"smartoffice|0.70,0.80":3,"smartoffice|0.65,0.8":5,"smartpc|0.90,0.80":1,"gaming|0.8,0.75":1,"commercialiot|0.15,0.20":11,"commercialiot|0.85,0.3":11,"smarthome|0.10,0.6":2,"smartoffice|0.6,0.30":7,"smartpc|0.40,0.20":1,"smartpc|0.4,0.20":1,"smarthome|0.00,0.75":1,"workstation|0.05,0.4":7,"workstation|0.1,0.85":1,"smartoffice|0.30,0.3":5,"mobilethinkpad|0.50,0.40":2,"smartoffice|0.60,0.70":4,"gaming|0.65,0.70":4,"smartpc|0.4,0.3":2,"school|0.6,0.20":1,"entertainment|0.70,0.75":2,"school|0.30,0.3":11,"smartoffice|0.75,0.65":5,"mobilethinkpad|0.60,0.40":9,"school|0.3,0.25":9,"school|0.60,0.20":3,"entertainment|0.60,0.95":2,"workstation|0.5,0.8":1,"smartoffice|0.75,0.45":13,"smartoffice|0.70,0.7":3,"smarthome|0.65,0.40":6,"entertainment|0.60,0.90":4,"workstation|0.45,0.8":4,"entertainment|0.6,0.85":2,"commercialiot|0,0.25":3,"commercialiot|0.10,0.20":32,"commercialiot|0.50,0.3":6,"school|0.45,0.3":6,"smartpc|0.9,0.20":7,"school|0.20,0.3":9,"workstation|0.80,0.60":10,"gaming|0.7,0.60":7,"mobilethinkpad|0.45,0.50":2,"mobilethinkpad|0.35,0.50":6,"school|0.5,0.30":3,"school|0.2,0.4":2,"gaming|0.6,0.60":5,"workstation|0.6,0.35":12,"smartoffice|0.4,0.25":3,"smartpc|0.95,0.80":1,"commercialiot|0.00,0.80":7,"school|0.1,0.4":1,"mobilethinkpad|0.65,0.35":32,"school|0.00,0.4":2,"smarthome|0.5,0.65":5,"audiovideo|0.9,0.25":17,"commercialiot|0.00,0.70":3,"audiovideo|0.9,0.30":8,"audiovideo|0.90,0.40":5,"smarthome|0.75,0.50":8,"commercialiot|0.00,0.8":4,"school|0.35,0.60":3,"smartpc|0.20,0.6":1,"commercialiot|0.05,0.7":1,"entertainment|0.25,0.75":1,"workstation|0.2,0.75":1,"mobilethinkpad|0.85,0.40":21,"commercialiot|0.05,0.80":16,"entertainment|0.15,0.60":2,"entertainment|0.2,0.3":4,"workstation|0.10,0.90":2,"smartpc|0.15,0.40":13,"commercialiot|0.05,0.8":9,"commercialiot|0.05,0.75":11,"audiovideo|0,0.35":3,"commercialiot|0.2,0.20":2,"audiovideo|0.85,0.60":6,"gaming|0.80,0.60":5,"school|0.90,0.30":17,"audiovideo|0.9,0.50":1,"workstation|0.4,0.55":5,"gaming|0.75,0.4":17,"school|0.45,0.20":4,"entertainment|0.05,0.60":2,"audiovideo|0.40,0.6":4,"smarthome|0.30,0.40":3,"audiovideo|0.40,0.60":3,"mobilethinkpad|0.6,0.30":14,"gaming|0.60,0.75":2,"mobilethinkpad|0.4,0.20":1,"smartoffice|0.25,0.75":1,"school|0.65,0.40":5,"workstation|0.4,0.45":5,"mobilethinkpad|0.60,0.20":7,"smartoffice|0.40,0.65":2,"smarthome|0.55,0.20":7,"commercialiot|0.00,0.85":3,"school|0.00,0.3":5,"workstation|0.10,0.4":4,"commercialiot|0.7,0.25":5,"commercialiot|0.85,0.25":35,"gaming|0.80,0.5":6,"workstation|0.4,0.5":3,"smartoffice|0.20,0.65":4,"gaming|0.20,0.3":7,"mobilethinkpad|0.10,0.7":1,"smartoffice|0.45,0.75":1,"commercialiot|0.1,0.25":29,"audiovideo|0.40,0.5":2,"smartoffice|0.45,0.70":2,"smartpc|0.2,0.30":11,"smartoffice|0.90,0.4":4,"commercialiot|1,0.50":1,"smartoffice|0.40,0.8":4,"school|0.00,0.55":5,"school|0.25,0.20":22,"school|0.00,0.50":3,"school|0.00,0.45":4,"gaming|0.60,0.70":3,"entertainment|0.50,0.4":22,"entertainment|0.2,0.55":1,"audiovideo|0.90,0.90":2,"smartoffice|0.75,0.8":2,"entertainment|0.75,0.4":5,"gaming|0.45,0.55":9,"smartoffice|0.55,0.50":6,"commercialiot|0.35,0.60":14,"school|0.70,0.3":9,"mobilethinkpad|0.70,0.45":3,"smartoffice|0.40,0.55":3,"commercialiot|0.35,0.55":10,"gaming|0.50,0.7":1,"workstation|0.45,0.55":6,"smartpc|0.15,0.3":1,"commercialiot|0.30,0.7":4,"entertainment|0.65,0.40":34,"audiovideo|0.7,0.55":2,"smarthome|0.9,0.65":9,"smartoffice|0.00,0.55":5,"smarthome|0.80,0.85":1,"workstation|0.3,0.7":1,"smartpc|0.4,0.45":2,"commercialiot|0.75,0.5":1,"smartoffice|0.10,0.3":3,"commercialiot|0.30,0.60":3,"smarthome|0.9,0.7":1,"workstation|0.45,0.6":1,"workstation|0.45,0.60":1,"mobilethinkpad|0.6,0.80":1,"smartpc|0.50,0.65":2,"smarthome|0.3,0.35":3,"commercialiot|0.75,0.55":5,"school|0.55,0.4":5,"smarthome|0.45,0.4":3,"gaming|0.95,0.5":3,"smartpc|0.9,0.60":1,"gaming|0.4,0.30":19,"smartoffice|0.1,0.35":9,"commercialiot|0.90,0.50":3,"audiovideo|0.80,0.80":1,"audiovideo|0,0.40":1,"smartoffice|0.90,0.25":1,"smartpc|0.20,0.3":1,"commercialiot|0.05,0.70":3,"smarthome|0.8,0.45":1,"entertainment|0.65,0.45":4,"smartoffice|0.00,0.45":10,"smartpc|0.15,0.25":2,"school|0.60,0.75":1,"smarthome|0.70,0.3":5,"smartoffice|0.20,0.40":16,"entertainment|0.90,0.55":3,"school|0.05,0.4":4,"smarthome|0.85,0.6":4,"entertainment|0.50,0.45":3,"school|0.45,0.85":8,"mobilethinkpad|0.9,0.65":1,"smartpc|0.70,0.55":12,"smartpc|0.70,0.3":4,"school|0.7,0.40":3,"commercialiot|0.1,0.20":9,"school|0.45,0.90":3,"smartoffice|0.1,0.55":3,"smartoffice|0.45,0.4":1,"school|0.35,0.3":9,"workstation|0.40,0.5":4,"smartoffice|0.40,0.4":4,"smartoffice|0.35,0.5":4,"smartoffice|0.15,0.6":2,"commercialiot|0.80,0.6":1,"gaming|0.30,0.5":2,"workstation|0.10,0.40":11,"gaming|0.3,0.50":1,"gaming|0.5,0.6":1,"workstation|0.6,0.40":5,"smartoffice|0.90,0.7":1,"commercialiot|0.8,0.5":2,"gaming|0.70,0.80":5,"mobilethinkpad|0.9,0.50":12,"mobilethinkpad|0.1,0.40":3,"smartpc|0.55,0.45":2,"school|0.2,0.45":3,"school|0.45,0.80":5,"gaming|0.90,0.5":2,"smarthome|0.2,0.35":3,"mobilethinkpad|0.50,0.35":29,"commercialiot|0.70,0.25":30,"smartpc|0.65,0.8":1,"entertainment|0.7,0.30":11,"workstation|0.30,0.40":10,"entertainment|0.00,0.50":5,"audiovideo|0.80,0.45":13,"gaming|0.45,0.5":3,"commercialiot|0.70,0.20":7,"school|0.25,0.45":4,"school|0.45,0.55":2,"smartpc|0.05,0.30":10,"workstation|0.90,0.30":3,"school|0.2,0.40":4,"entertainment|0.80,0.4":6,"smartpc|0.75,0.30":17,"school|0.15,0.40":13,"smartoffice|0.7,0.35":6,"school|0.55,0.3":8,"smarthome|0.1,0.70":1,"commercialiot|0.65,0.20":3,"school|0.00,0.20":5,"mobilethinkpad|0.6,0.3":2,"school|0.2,0.20":7,"school|0.40,0.55":2,"entertainment|0.40,0.80":1,"gaming|0.7,0.65":4,"smartoffice|0.50,0.45":5,"smartpc|0.95,0.50":2,"school|0.50,0.6":3,"commercialiot|0.9,0.20":11,"smarthome|0.8,0.40":1,"smarthome|0.3,0.25":1,"entertainment|0.05,0.3":5,"commercialiot|0.7,0.20":1,"smarthome|0.6,0.70":1,"smarthome|0.9,0.4":1,"smartoffice|0.6,0.40":1,"school|0.50,0.55":2,"school|0.05,0.20":10,"gaming|0.20,0.5":11,"workstation|0.50,0.25":3,"smartoffice|0.55,0.4":2,"school|0.50,0.65":5,"school|0.30,0.4":2,"smartoffice|0.00,0.4":7,"school|0.25,0.4":6,"entertainment|0.80,0.3":3,"entertainment|0.15,0.7":1,"school|0.20,0.40":9,"smartpc|0.3,0.30":2,"commercialiot|0.20,0.5":1,"school|0.50,0.20":4,"audiovideo|0.70,0.85":2,"smarthome|0.5,0.35":11,"smartoffice|0.35,0.60":6,"smartoffice|0.8,0.40":5,"entertainment|0.40,0.45":5,"mobilethinkpad|0.8,0.35":2,"commercialiot|0.75,0.20":11,"smarthome|0.90,0.3":11,"audiovideo|0.90,0.5":1,"workstation|0.5,0.25":1,"commercialiot|0.8,0.25":8,"school|0.40,0.45":2,"smarthome|0.7,0.40":1,"gaming|0.4,0.25":4,"smartoffice|0.8,0.85":1,"commercialiot|0.20,0.55":4,"smarthome|0.05,0.3":4,"audiovideo|0.90,0.3":7,"entertainment|0.05,0.90":5,"mobilethinkpad|0.05,0.6":2,"smarthome|0.00,0.25":3,"workstation|0.80,0.6":1,"entertainment|0.35,0.4":1,"entertainment|0.70,0.3":9,"smartpc|0.35,0.80":1,"school|0.5,0.25":2,"smartoffice|0.05,0.7":2,"entertainment|0.4,0.25":3,"entertainment|0.1,0.85":3,"audiovideo|0.50,0.70":4,"workstation|0.80,0.7":5,"mobilethinkpad|0.80,0.4":17,"smartpc|0.55,0.20":4,"commercialiot|0.35,0.6":1,"commercialiot|0.85,0.50":3,"school|0.15,0.50":5,"entertainment|0.4,0.30":4,"gaming|0.65,0.80":2,"audiovideo|0.85,0.75":1,"workstation|0.95,0.55":6,"gaming|0.80,0.8":1,"smartpc|0.20,0.4":7,"smartpc|0.6,0.25":11,"audiovideo|0.65,0.70":3,"school|0.05,0.40":6,"entertainment|0.80,0.45":3,"smartpc|0.70,0.50":1,"school|0.30,0.40":10,"smarthome|0.95,0.25":6,"gaming|0.95,0.4":13,"smartpc|0.10,0.50":17,"workstation|0.40,0.70":1,"smartpc|0.10,0.5":2,"smartpc|0.05,0.55":3,"smartoffice|0.45,0.2":1,"audiovideo|0.05,0.90":2,"smartoffice|0.35,0.55":5,"smartpc|0.6,0.20":1,"mobilethinkpad|0.25,0.80":1,"mobilethinkpad|0.35,0.55":1,"entertainment|0.65,0.55":4,"workstation|0.75,0.6":2,"mobilethinkpad|0.80,0.40":17,"mobilethinkpad|0.3,0.50":1,"smartpc|0.55,0.40":3,"entertainment|0.7,0.3":2,"audiovideo|0.15,0.6":1,"mobilethinkpad|0.15,0.6":2,"smartpc|0.8,0.55":3,"mobilethinkpad|0.2,0.65":2,"smartpc|0.1,0.6":1,"smarthome|0.85,0.3":4,"entertainment|0.6,0.90":1,"entertainment|0.50,0.3":2,"school|0.95,0.60":2,"audiovideo|0.95,0.45":5,"mobilethinkpad|0.75,0.45":10,"smartoffice|0.35,0.65":5,"entertainment|0.45,0.8":4,"commercialiot|1,0.40":3,"school|0.50,0.45":3,"entertainment|0.85,0.25":17,"workstation|0.8,0.4":1,"mobilethinkpad|0.55,0.4":3,"smarthome|0.15,0.70":2,"workstation|0.20,0.85":3,"workstation|0.65,0.40":11,"mobilethinkpad|0.80,0.45":26,"mobilethinkpad|0.3,0.45":1,"school|0.70,0.40":3,"smarthome|0.45,0.60":3,"smartpc|0.55,0.3":6,"smarthome|0.45,0.50":4,"mobilethinkpad|0.50,0.45":2,"commercialiot|0.20,0.45":7,"gaming|0.55,0.25":4,"commercialiot|0.9,0.40":4,"smartpc|0.10,0.60":1,"mobilethinkpad|0.65,0.55":6,"commercialiot|0.1,0.75":3,"smartpc|0.10,0.6":1,"workstation|0.00,0.3":4,"audiovideo|0.3,0.30":8,"workstation|0.45,0.50":11,"school|0.3,0.3":2,"workstation|0.15,0.7":1,"workstation|0.5,0.85":2,"entertainment|0.25,0.6":2,"audiovideo|0.05,0.3":8,"workstation|0.50,0.55":1,"workstation|0.55,0.45":2,"mobilethinkpad|0.60,0.3":4,"gaming|0.55,0.3":3,"smartpc|0.7,0.25":4,"gaming|0.25,0.90":2,"workstation|0.7,0.45":2,"smartpc|0.75,0.3":2,"gaming|0.4,0.70":1,"workstation|0.70,0.5":1,"gaming|0.20,0.85":2,"gaming|0.30,0.95":1,"school|0.70,0.55":4,"smartoffice|0.6,0.3":2,"workstation|0.80,0.70":10,"audiovideo|0.60,0.60":2,"smartpc|0.15,0.7":2,"audiovideo|0.60,0.4":3,"smartpc|0.65,0.20":5,"school|0.40,0.85":1,"audiovideo|0.00,0.95":1,"smartoffice|0.7,0.30":1,"smartpc|0.65,0.3":2,"school|0.75,0.4":8,"smartpc|0.7,0.20":1,"school|0.30,0.70":1,"entertainment|0.80,0.8":1,"commercialiot|0.40,0.70":6,"entertainment|0.5,0.90":1,"mobilethinkpad|0.3,0.55":1,"workstation|0.90,0.80":1,"audiovideo|0.80,0.70":5,"smartpc|0.50,0.70":1,"gaming|0.8,0.5":1,"gaming|0.70,0.8":2,"gaming|0.50,0.6":6,"workstation|0.85,0.30":9,"audiovideo|0.80,0.20":4,"smartoffice|0.45,0.5":1,"smartpc|0.15,0.45":22,"smartpc|0.60,0.45":3,"mobilethinkpad|0.65,0.75":2,"smartpc|0.45,0.70":1,"smarthome|0.30,0.20":8,"audiovideo|0.55,0.45":12,"school|0.90,0.60":1,"entertainment|0.4,0.65":1,"audiovideo|0.85,0.50":10,"smartpc|0.7,0.30":6,"smartpc|0.85,0.75":4,"mobilethinkpad|0.1,0.85":1,"smartoffice|0.85,0.75":4,"school|0.8,0.30":13,"smarthome|0.30,0.25":9,"gaming|0.6,0.35":20,"entertainment|0.1,0.80":1,"commercialiot|0.45,0.6":4,"audiovideo|0.85,0.70":2,"mobilethinkpad|0.65,0.85":1,"workstation|0.40,0.4":2,"mobilethinkpad|0.25,0.20":3,"gaming|0.50,0.70":1,"workstation|0.35,0.45":5,"mobilethinkpad|0.70,0.70":7,"smartoffice|0.40,0.3":13,"smartpc|0.50,0.85":1,"entertainment|0.8,0.30":15,"mobilethinkpad|0.70,0.50":7,"smartpc|0.60,0.75":1,"school|0.75,0.60":1,"smarthome|0.70,0.6":1,"smartpc|0.8,0.75":4,"school|0.80,0.50":3,"smartpc|0.25,0.7":1,"commercialiot|0.65,0.70":2,"school|0.85,0.60":5,"mobilethinkpad|0.90,0.6":1,"entertainment|0.75,0.60":1,"gaming|0.2,0.8":1,"commercialiot|0.85,0.6":1,"entertainment|0.45,0.65":1,"audiovideo|0.70,0.65":3,"commercialiot|0.80,0.25":15,"school|0.95,0.50":1,"school|0.85,0.3":1,"school|0.95,0.45":4,"workstation|0.15,0.80":2,"smartoffice|0.30,0.7":2,"commercialiot|0.8,0.3":4,"smartoffice|0.3,0.5":3,"workstation|0.6,0.55":2,"smartoffice|0.8,0.20":2,"smarthome|0.7,0.75":2,"audiovideo|0.9,0.40":5,"gaming|0.5,0.5":1,"smartoffice|0.70,0.20":6,"school|0.20,0.65":1,"smartoffice|0.40,0.2":1,"entertainment|0.60,0.20":1,"smartoffice|0.7,0.20":4,"entertainment|0.55,0.20":3,"entertainment|0.10,0.3":5,"school|0.8,0.40":1,"entertainment|0.10,0.25":7,"workstation|0.85,0.6":2,"smartoffice|0.30,0.15":1,"smartoffice|0.35,0.15":1,"school|0.85,0.70":2,"audiovideo|0.80,0.3":2,"commercialiot|0.70,0.6":5,"school|0.65,0.65":4,"smarthome|0.90,0.7":2,"school|0.7,0.55":1,"mobilethinkpad|0.6,0.45":1,"smartpc|0.70,0.20":1,"mobilethinkpad|0.85,0.5":2,"gaming|0.40,0.90":2,"smartoffice|0.55,0.15":1,"smartoffice|0.30,0.20":1,"school|0.10,0.4":3,"smartoffice|0.10,0.5":3,"commercialiot|0.25,0.5":2,"smartpc|0.2,0.5":4,"audiovideo|0.95,0.55":7,"school|0.90,0.5":1,"mobilethinkpad|0.75,0.6":4,"smartpc|0.20,0.5":6,"school|0.40,0.65":3,"mobilethinkpad|0.10,0.4":5,"school|0.7,0.50":2,"workstation|0.50,0.40":7,"school|0.45,0.60":3,"mobilethinkpad|0.05,0.30":27,"commercialiot|0.50,0.7":2,"mobilethinkpad|0.3,0.60":1,"mobilethinkpad|0.90,0.4":1,"commercialiot|0.50,0.65":23,"smartoffice|0.2,0.5":1,"entertainment|0.90,0.6":1,"workstation|0.1,0.40":6,"smarthome|0.85,0.8":2,"smartoffice|0.05,0.5":2,"entertainment|0.7,0.90":1,"workstation|0.80,0.75":7,"mobilethinkpad|0.8,0.40":2,"school|0.55,0.45":1,"smartpc|0.55,0.8":1,"school|0.75,0.55":1,"smarthome|0.7,0.50":5,"commercialiot|0.2,0.4":2,"gaming|0.55,0.5":7,"smartoffice|0.20,0.50":6,"commercialiot|0.40,0.6":1,"commercialiot|0.4,0.65":1,"school|0.9,0.50":1,"commercialiot|0.45,0.3":3,"school|0.55,0.55":6,"school|0.65,0.55":2,"smartoffice|0.30,0.80":3,"smarthome|0.15,0.3":2,"audiovideo|0.3,0.75":2,"gaming|0.3,0.75":1,"school|0.7,0.45":2,"audiovideo|0.8,0.35":3,"smartoffice|0.60,0.80":5,"gaming|0.9,0.50":1,"school|0.60,0.70":1,"gaming|0.7,0.5":3,"workstation|0.90,0.4":8,"school|0.85,0.4":2,"school|0.25,0.50":5,"gaming|0.30,0.80":1,"smartoffice|0.4,0.40":1,"smartoffice|0.20,0.45":7,"school|0.70,0.4":1,"audiovideo|0.75,0.90":1,"smartoffice|0.25,0.3":2,"entertainment|0.35,0.25":44,"workstation|0.5,0.50":3,"smartoffice|0.40,0.75":9,"school|0.15,0.6":2,"audiovideo|0.2,0.50":1,"smartpc|0.15,0.70":1,"school|0.05,0.3":5,"workstation|0.60,0.50":5,"commercialiot|0.8,0.4":2,"workstation|0.05,0.85":2,"workstation|0.60,0.55":2,"workstation|0.8,0.35":4,"smartoffice|0.60,0.85":1,"smartpc|0.35,0.5":2,"smartoffice|0.35,0.85":4,"school|0.70,0.65":4,"smartoffice|0.35,0.90":2,"commercialiot|0.35,0.5":4,"commercialiot|0.85,0.75":2,"smartpc|0.45,0.20":1,"commercialiot|0.60,0.55":4,"workstation|0.9,0.5":1,"mobilethinkpad|0.30,0.35":4,"school|0.45,0.4":4,"smartpc|0.6,0.45":4,"commercialiot|0.20,0.6":3,"school|0.65,0.3":4,"smarthome|0.7,0.70":1,"smarthome|0.70,0.60":2,"smartpc|0.3,0.70":1,"workstation|0.9,0.30":1,"smartpc|0.2,0.50":4,"commercialiot|0.20,0.50":9,"smartpc|0.55,0.55":2,"commercialiot|0.25,0.75":3,"audiovideo|0.65,0.85":1,"smartpc|0.20,0.55":12,"commercialiot|0.6,0.50":3,"audiovideo|0.50,0.45":8,"school|0.1,0.40":2,"smarthome|0.00,0.55":9,"mobilethinkpad|0.20,0.5":2,"commercialiot|0.70,0.60":5,"smarthome|0.35,0.3":2,"mobilethinkpad|0.9,0.40":2,"entertainment|0.30,0.7":1,"audiovideo|0.95,0.65":3,"smartpc|0.4,0.50":7,"school|0.00,0.7":3,"smarthome|0.2,0.7":1,"mobilethinkpad|0.8,0.85":1,"smartpc|0.40,0.6":1,"mobilethinkpad|0.25,0.5":3,"commercialiot|0,0.40":1,"school|0.75,0.3":4,"gaming|0.25,0.3":9,"smartpc|0.1,0.50":2,"mobilethinkpad|0.6,0.40":4,"smartpc|0.70,0.85":1,"smarthome|0.50,0.3":3,"smarthome|0.70,0.85":1,"smarthome|0.20,0.3":9,"entertainment|0.75,0.8":1,"entertainment|0.45,0.75":5,"smartoffice|0.3,0.50":2,"smarthome|0.3,0.30":2,"smartoffice|0.2,0.55":2,"mobilethinkpad|0.7,0.6":1,"smarthome|0.10,0.5":4,"commercialiot|0.70,0.7":1,"mobilethinkpad|0.1,0.25":12,"smartpc|0.2,0.45":5,"smartpc|0.40,0.65":1,"school|0.90,0.25":1,"smarthome|0.70,0.4":2,"smartpc|0.60,0.65":7,"smartpc|0.30,0.4":2,"entertainment|0.6,0.95":1,"smartpc|0.75,0.8":2,"entertainment|0.35,0.3":6,"audiovideo|0.85,0.3":5,"smartoffice|0.4,0.45":1,"smartoffice|0.60,0.8":1,"entertainment|0.70,0.95":1,"commercialiot|0.80,0.50":1,"smartpc|0.25,0.60":1,"smarthome|0.5,0.45":2,"smarthome|0.05,0.7":2,"smarthome|0.9,0.45":2,"smarthome|0.70,0.40":8,"entertainment|0.6,0.50":1,"mobilethinkpad|0.95,0.6":3,"smartoffice|0.35,0.4":3,"smartoffice|0.60,0.2":1,"mobilethinkpad|0.95,0.30":1,"gaming|0.65,0.75":2,"audiovideo|0.2,0.75":2,"gaming|1,0.25":2,"mobilethinkpad|0.20,0.85":1,"smarthome|0.95,0.3":4,"smartpc|0.10,0.65":3,"school|0.80,0.3":7,"mobilethinkpad|0.85,0.25":2,"smartpc|0.3,0.35":3,"school|0.75,0.70":2,"school|0.4,0.60":1,"smartoffice|0.30,0.50":13,"smartoffice|0.50,0.2":1,"commercialiot|0.7,0.3":2,"school|0.8,0.3":1,"mobilethinkpad|0.30,0.65":2,"smartpc|0.65,0.75":3,"entertainment|0,0.25":3,"commercialiot|0.50,0.50":10,"mobilethinkpad|0.7,0.60":1,"mobilethinkpad|0.9,0.25":7,"smartpc|0.30,0.45":10,"smartpc|1,0.25":1,"school|0.90,0.70":1,"entertainment|0.5,0.40":1,"entertainment|0.60,0.45":3,"school|0,0.35":2,"smartoffice|0.55,0.55":14,"commercialiot|0.4,0.50":4,"audiovideo|0.80,0.75":5,"workstation|0.25,0.45":5,"workstation|0.4,0.4":2,"smartoffice|0.30,0.60":1,"audiovideo|0.45,0.3":1,"mobilethinkpad|0.9,0.30":5,"smartoffice|0.30,0.55":2,"smartpc|0.85,0.80":2,"commercialiot|0.10,0.65":5,"mobilethinkpad|0.65,0.45":6,"workstation|0.6,0.45":1,"smartoffice|0.20,0.70":3,"commercialiot|0.30,0.4":6,"smartoffice|0.20,0.7":3,"smartpc|0.20,0.60":3,"commercialiot|0.40,0.5":4,"audiovideo|0.65,0.25":5,"smartpc|0.60,0.55":2,"smartpc|0.90,0.70":1,"smarthome|0.25,0.3":3,"mobilethinkpad|0.90,0.25":4,"smartoffice|0.20,0.6":2,"entertainment|0.5,0.35":5,"mobilethinkpad|0.40,0.4":3,"entertainment|0.5,0.30":16,"audiovideo|0.50,0.35":7,"audiovideo|0.50,0.30":5,"mobilethinkpad|0.75,0.3":7,"school|0.7,0.30":4,"smarthome|0.6,0.75":1,"mobilethinkpad|0.8,0.30":9,"commercialiot|0.25,0.60":4,"mobilethinkpad|0.70,0.75":2,"mobilethinkpad|0.8,0.3":1,"smartpc|0.95,0.4":2,"commercialiot|0.2,0.30":3,"audiovideo|0.9,0.3":5,"workstation|0.9,0.45":5,"smartpc|0.1,0.40":1,"workstation|0.25,0.4":1,"smartoffice|0.4,0.50":3,"gaming|0.05,0.20":1,"mobilethinkpad|0.2,0.8":1,"smartoffice|0.6,0.70":1,"smartpc|0.75,0.45":2,"school|0.75,0.5":1,"workstation|0.45,0.40":14,"smartoffice|0.35,0.70":2,"school|0.60,0.4":1,"gaming|0.4,0.55":2,"smartoffice|0.15,0.5":4,"school|0.45,0.45":3,"workstation|0.5,0.35":8,"workstation|0.65,0.4":4,"smartpc|0.1,0.35":4,"workstation|0.85,0.25":1,"school|0.60,0.45":2,"entertainment|0,0.50":1,"smartoffice|0.2,0.50":1,"workstation|0.7,0.7":1,"audiovideo|0.60,0.20":1,"workstation|0.70,0.65":2,"audiovideo|0.8,0.65":2,"smartpc|0.1,0.30":4,"smarthome|0.40,0.60":1,"entertainment|0.50,0.20":12,"smartpc|0.7,0.8":1,"smarthome|0.20,0.7":1,"smartpc|0.55,0.70":2,"commercialiot|0.10,0.70":3,"smarthome|0.00,0.65":2,"gaming|0.15,0.60":50,"smartpc|0.05,0.3":1,"commercialiot|0.10,0.80":3,"audiovideo|0.50,0.40":6,"workstation|0.4,0.75":1,"smartoffice|0.80,0.80":3,"audiovideo|0.85,0.40":15,"workstation|0.8,0.25":4,"smartoffice|0.95,0.80":3,"smartoffice|0.7,0.45":1,"smarthome|0.80,0.5":3,"entertainment|0.20,0.6":1,"smartoffice|0.10,0.60":2,"school|0.2,0.50":2,"entertainment|0.8,0.40":29,"smartpc|0.2,0.35":4,"smartpc|0.6,0.3":1,"workstation|0.50,0.4":2,"workstation|0.30,0.5":1,"workstation|0.3,0.4":1,"commercialiot|0.3,0.20":3,"school|0.6,0.55":1,"smartpc|0.90,0.15":2,"school|0.9,0.35":14,"audiovideo|0.90,0.65":2,"workstation|0.00,0.40":3,"workstation|0.6,0.30":11,"smartoffice|0.25,0.6":2,"workstation|0.35,0.4":2,"smartoffice|0.30,0.45":19,"workstation|0.4,0.6":1,"smartoffice|0.75,0.20":1,"audiovideo|0.6,0.65":1,"workstation|0.60,0.25":2,"smarthome|0.10,0.20":5,"smartpc|0.9,0.55":2,"commercialiot|0.05,0.6":1,"smarthome|0.15,0.20":3,"mobilethinkpad|0.8,0.5":2,"entertainment|0,0.65":2,"audiovideo|0.1,0.4":1,"workstation|0.15,0.75":2,"smartoffice|0.10,0.70":1,"audiovideo|0.6,0.70":1,"mobilethinkpad|0.45,0.7":3,"audiovideo|0,0.3":1,"audiovideo|0.90,0.4":2,"school|0.05,0.45":5,"entertainment|0.70,0.4":1,"workstation|0.25,0.25":9,"smarthome|0.05,0.15":1,"workstation|0.05,0.60":3,"smarthome|0.4,0.75":1,"gaming|0.35,0.20":36,"smartpc|0.3,0.6":1,"smarthome|0.6,0.30":3,"mobilethinkpad|0.6,0.60":7,"school|0.30,0.55":3,"school|0.15,0.2":1,"workstation|0.95,0.8":2,"school|0.15,0.15":1,"audiovideo|0.4,0.70":2,"gaming|1,0.3":1,"smartoffice|0.05,0.6":1,"school|0.15,0.70":1,"entertainment|0.2,0.4":5,"school|0.50,0.50":4,"entertainment|0.9,0.45":5,"entertainment|0.65,0.65":6,"school|0.55,0.65":4,"mobilethinkpad|0.6,0.35":6,"school|0.20,0.20":17,"smarthome|0.05,0.20":1,"workstation|0.2,0.65":4,"smartoffice|0.40,0.40":5,"commercialiot|0.30,0.8":3,"smarthome|0.35,0.5":1,"mobilethinkpad|0.60,0.4":5,"entertainment|0.85,0.20":5,"entertainment|0.30,0.6":1,"workstation|0.5,0.40":3,"mobilethinkpad|0.75,0.8":3,"commercialiot|0.60,0.8":2,"smartpc|0.90,0.35":17,"smarthome|0.60,0.50":1,"audiovideo|0.75,0.7":2,"smartoffice|0.30,0.8":1,"smartpc|0.9,0.85":1,"mobilethinkpad|0.35,0.85":2,"school|0.05,0.60":8,"audiovideo|0.80,0.90":1,"mobilethinkpad|0.15,0.65":5,"smartoffice|0.80,0.60":2,"school|0.10,0.65":3,"audiovideo|0.30,0.5":2,"smartoffice|0.40,0.45":4,"workstation|0.95,0.5":1,"smartoffice|0.70,0.3":4,"mobilethinkpad|0.2,0.25":4,"commercialiot|0.1,0.3":2,"school|0.35,0.6":1,"smartoffice|0.6,0.7":1,"workstation|0.45,0.80":3,"smarthome|0.65,0.3":7,"gaming|0.65,0.6":3,"smartpc|0.40,0.5":5,"school|0.50,0.4":3,"entertainment|0.5,0.8":18,"audiovideo|0.25,0.3":6,"commercialiot|0.15,0.2":1,"commercialiot|0.45,0.40":3,"mobilethinkpad|0.35,0.2":2,"smartpc|0.5,0.65":1,"smarthome|0.40,0.3":2,"audiovideo|0.3,0.25":2,"smartoffice|0.6,0.35":4,"commercialiot|0.20,0.8":1,"commercialiot|0.95,0.60":3,"mobilethinkpad|0.9,0.5":1,"smartpc|0.30,0.65":6,"workstation|0.80,0.25":7,"smartpc|0.95,0.45":4,"entertainment|0.20,0.7":1,"workstation|0.9,0.7":1,"smartpc|0.8,0.40":1,"school|0.35,0.65":2,"school|0.4,0.70":1,"smarthome|0.2,0.65":1,"workstation|0.40,0.3":5,"commercialiot|0.45,0.75":2,"commercialiot|0.95,0.55":4,"school|0.25,0.55":3,"smartoffice|0.75,0.6":1,"commercialiot|0.3,0.65":3,"commercialiot|0.55,0.8":1,"smartoffice|0.1,0.4":6,"audiovideo|0.9,0.20":2,"audiovideo|0.60,0.25":1,"commercialiot|0.2,0.55":2,"smarthome|0.45,0.85":1,"smartpc|0.45,0.7":3,"smartpc|0.30,0.60":2,"smarthome|0.20,0.75":1,"smarthome|0.35,0.55":6,"audiovideo|0.7,0.7":1,"smartoffice|0.95,0.6":2,"commercialiot|0.3,0.40":3,"audiovideo|0.6,0.50":5,"commercialiot|0.65,0.55":4,"smarthome|0.50,0.45":2,"workstation|0.70,0.4":3,"school|0.15,0.65":5,"audiovideo|0.35,0.25":8,"smarthome|0.25,0.15":1,"smartpc|0.60,0.3":4,"school|0.5,0.65":1,"school|0.65,0.45":2,"audiovideo|0.7,0.50":1,"audiovideo|0.70,0.4":19,"smartoffice|0.8,0.5":1,"smartoffice|0.65,0.2":1,"smartpc|0.9,0.4":2,"commercialiot|0.50,0.6":1,"mobilethinkpad|0.9,0.45":2,"commercialiot|0.15,0.75":5,"workstation|0.45,0.25":15,"workstation|0.15,0.70":2,"smartpc|0.90,0.4":4,"workstation|0.2,0.55":1,"smartoffice|0.40,0.60":2,"school|0.3,0.40":3,"smarthome|0.20,0.5":1,"entertainment|0,0.40":4,"workstation|0.4,0.30":4,"entertainment|0.25,0.70":1,"audiovideo|0.6,0.35":8,"smartpc|0.55,0.4":1,"smartpc|0.3,0.45":6,"mobilethinkpad|0.70,0.80":3,"smartpc|0.8,0.4":1,"workstation|0.45,0.20":1,"workstation|0.3,0.55":2,"smartoffice|0.90,0.8":1,"smartpc|0.30,0.5":2,"commercialiot|0.15,0.60":4,"smartpc|0.65,0.7":1,"workstation|0.20,0.50":4,"smartoffice|0.3,0.45":1,"smartpc|0.80,0.80":1,"workstation|0.05,0.65":4,"mobilethinkpad|0.30,0.40":1,"commercialiot|0.9,0.3":3,"smarthome|0.30,0.7":1,"workstation|0.5,0.3":1,"smartpc|0.3,0.55":1,"commercialiot|0.95,0.7":1,"smartpc|0.3,0.5":2,"audiovideo|0.50,0.25":1,"audiovideo|0.9,0.65":1,"commercialiot|0.40,0.8":1,"smarthome|0.90,0.8":2,"entertainment|0.1,0.50":1,"smartpc|0.55,0.50":3,"smartpc|0.4,0.40":3,"school|0.50,0.70":2,"gaming|0.30,0.20":30,"smartoffice|0.95,0.60":3,"school|0.3,0.55":1,"smartpc|0.10,0.7":1,"workstation|0.60,0.6":1,"workstation|0.35,0.25":3,"workstation|0.2,0.30":5,"mobilethinkpad|0.7,0.45":1,"school|0.05,0.7":1,"mobilethinkpad|0.05,0.75":1,"smarthome|0.7,0.35":1,"workstation|0.7,0.60":1,"smartoffice|0.05,0.60":1,"audiovideo|0.85,0.80":1,"smartoffice|0.30,0.70":3,"workstation|0.5,0.4":2,"commercialiot|0.20,0.2":1,"smartoffice|0.70,0.4":3,"audiovideo|0.1,0.3":2,"smartoffice|0.60,0.4":1,"smartpc|0.45,0.75":3,"school|0.3,0.70":1,"school|0.3,0.60":1,"school|0.3,0.65":2,"entertainment|0.40,0.3":1,"audiovideo|0.2,0.30":4,"workstation|0.30,0.3":1,"mobilethinkpad|0.90,0.7":2,"school|0.6,0.7":1,"commercialiot|0.4,0.40":2,"commercialiot|0.65,0.6":2,"smartoffice|0.80,0.4":4,"smartoffice|0.75,0.4":5,"commercialiot|0.00,0.65":1,"audiovideo|0.80,0.95":1,"audiovideo|0.6,0.45":3,"mobilethinkpad|0.5,0.30":2,"commercialiot|0.25,0.4":3,"mobilethinkpad|0.5,0.35":1,"smartpc|0.35,0.70":1,"mobilethinkpad|0.1,0.30":6,"smartpc|0.45,0.65":6,"mobilethinkpad|0.75,0.70":8,"workstation|0.20,0.4":1,"mobilethinkpad|0.05,0.70":2,"school|0.40,0.70":3,"workstation|0.15,0.2":1,"mobilethinkpad|0.05,0.25":70,"smartpc|0.40,0.7":1,"school|0.9,0.3":1,"smartpc|0.45,0.60":4,"mobilethinkpad|0.70,0.60":2,"mobilethinkpad|0.95,0.7":3,"audiovideo|0.90,0.70":5,"mobilethinkpad|0.55,0.90":5,"entertainment|0.3,0.7":1,"workstation|0.9,0.70":1,"workstation|0.25,0.20":1,"entertainment|0.50,0.75":1,"smartpc|0.4,0.60":1,"smartpc|0.4,0.7":2,"smartoffice|0.75,0.60":1,"smartpc|0.5,0.60":1,"smartpc|0.4,0.65":3,"smarthome|0.8,0.85":1,"mobilethinkpad|0.9,0.4":7,"smartpc|0.4,0.70":3,"commercialiot|0.8,0.20":5,"workstation|0.20,0.6":1,"smartoffice|0.05,0.85":1,"smarthome|0.4,0.40":1,"smartoffice|0.05,0.80":2,"workstation|0.6,0.90":1,"smartpc|0.5,0.6":2,"commercialiot|0.3,0.50":2,"commercialiot|0.15,0.6":2,"gaming|0.65,0.30":34,"workstation|0.2,0.50":1,"mobilethinkpad|0.90,0.5":4,"mobilethinkpad|0.95,0.70":5,"smartpc|0.3,0.4":1,"commercialiot|0.6,0.65":2,"workstation|0.90,0.5":3,"workstation|0.2,0.45":2,"smartoffice|0.00,0.65":1,"smartoffice|0.70,0.45":2,"school|0.75,0.45":5,"entertainment|0.3,0.3":1,"entertainment|0.55,0.8":3,"smartoffice|0.25,0.4":1,"smartoffice|0.95,0.5":3,"audiovideo|0.10,0.7":1,"mobilethinkpad|0.7,0.40":1,"commercialiot|0.80,0.20":8,"smarthome|0.30,0.55":3,"mobilethinkpad|0.60,0.50":2,"workstation|0.7,0.70":1,"mobilethinkpad|0.60,0.45":2,"audiovideo|0.60,0.6":1,"smartoffice|0.80,0.3":1,"smarthome|0.35,0.35":5,"workstation|0.20,0.3":1,"mobilethinkpad|0.75,0.7":1,"smartpc|0.30,0.30":7,"school|0.9,0.45":3,"smartpc|0.60,0.60":4,"commercialiot|0.10,0.3":3,"commercialiot|0.2,0.45":1,"smarthome|0.75,0.3":12,"smartoffice|0.80,0.8":1,"smartoffice|0.80,0.6":1,"smartoffice|0.7,0.80":1,"smartoffice|0.45,0.6":1,"audiovideo|0.8,0.4":2,"commercialiot|0.95,0.2":4,"smartoffice|0.5,0.55":3,"workstation|0.2,0.70":1,"smartpc|0.1,0.45":1,"smartoffice|0.85,0.80":1,"smartoffice|0.30,0.6":1,"smartoffice|0.15,0.7":1,"school|0.2,0.60":1,"smartoffice|0.25,0.70":3,"workstation|0.1,0.4":2,"entertainment|0.20,0.5":1,"gaming|0.4,0.60":1,"audiovideo|0.7,0.75":2,"audiovideo|0.60,0.75":1,"mobilethinkpad|0.3,0.4":1,"smartoffice|0.25,0.8":1,"smartpc|0.90,0.55":6,"workstation|0.60,0.3":1,"smartpc|0.90,0.50":3,"smartoffice|0.2,0.25":2,"smartoffice|0.70,0.40":6,"smarthome|0.30,0.45":1,"mobilethinkpad|0.10,0.6":1,"school|0.90,0.75":1,"school|0.90,0.40":7,"workstation|0.65,0.3":8,"commercialiot|0.4,0.75":1,"school|0.60,0.65":2,"school|0.90,0.4":14,"workstation|0.55,0.25":2,"commercialiot|0.6,0.40":3,"smartpc|0.50,0.20":2,"workstation|0.00,0.75":2,"smartoffice|0.00,0.30":6,"gaming|0.85,0.8":2,"entertainment|0.1,0.8":2,"mobilethinkpad|0.9,0.8":1,"audiovideo|0.50,0.8":1,"commercialiot|0.6,0.4":2,"entertainment|0.3,0.55":3,"smartoffice|0.90,0.5":1,"workstation|0.6,0.4":3,"school|0.10,0.45":4,"smartoffice|0.9,0.4":3,"gaming|0.70,0.20":1,"commercialiot|0,0.30":4,"gaming|0.10,0.3":4,"workstation|0.65,0.20":2,"commercialiot|1,0.4":1,"commercialiot|0.9,0.45":1,"workstation|0.80,0.3":1,"mobilethinkpad|0.3,0.3":9,"school|0.8,0.4":2,"workstation|0.75,0.80":1,"school|0.80,0.8":1,"smartoffice|0.40,0.7":2,"smartpc|0.6,0.4":1,"commercialiot|0.35,0.7":1,"entertainment|0.70,0.70":3,"school|0.6,0.25":19,"entertainment|0.70,0.7":1,"workstation|0.80,0.20":1,"smartpc|0.8,0.35":2,"workstation|0.2,0.20":1,"entertainment|0.75,0.65":1,"audiovideo|0.85,0.8":1,"smartpc|0.05,0.4":3,"smarthome|0.2,0.30":4,"smartoffice|0.40,0.70":2,"entertainment|0.75,0.50":1,"commercialiot|0.80,0.45":1,"workstation|0.70,0.20":1,"workstation|0.50,0.3":2,"commercialiot|0,0.45":1,"commercialiot|0.1,0.5":1,"workstation|0.85,0.3":2,"smarthome|0.3,0.20":2,"workstation|0.55,0.5":1,"smarthome|0.2,0.25":2,"commercialiot|0.6,0.60":1,"commercialiot|0.45,0.5":5,"school|0.95,0.40":2,"smarthome|0.75,0.20":17,"school|0.25,0.65":1,"smarthome|0.65,0.65":3,"school|0.55,0.75":4,"school|0.50,0.75":4,"school|0.20,0.7":2,"workstation|0.5,0.55":1,"smartpc|0.10,0.4":4,"audiovideo|0.75,0.20":3,"workstation|0.8,0.30":4,"audiovideo|0.4,0.5":1,"commercialiot|0.8,0.45":1,"smarthome|0.40,0.5":1,"entertainment|0.3,0.5":1,"school|0.5,0.45":1,"gaming|0.3,0.3":12,"audiovideo|0.1,0.75":1,"mobilethinkpad|0.95,0.40":7,"workstation|0.4,0.35":11,"entertainment|0.55,0.45":4,"smartoffice|0.7,0.60":1,"mobilethinkpad|0.2,0.35":2,"smarthome|0.8,0.20":3,"workstation|0.60,0.5":1,"mobilethinkpad|0.10,0.25":14,"smarthome|0.4,0.3":1,"school|0.50,0.80":1,"entertainment|0.05,0.6":3,"audiovideo|0.35,0.7":1,"smartoffice|0.35,0.8":1,"audiovideo|0.80,0.7":1,"school|0.80,0.7":1,"mobilethinkpad|0.65,0.80":1,"school|0.45,0.65":2,"smarthome|0.1,0.45":1,"mobilethinkpad|0.1,0.4":1,"smartpc|0.3,0.40":1,"workstation|0.1,0.45":1,"commercialiot|0,0.55":1,"audiovideo|0.90,0.20":7,"smartpc|0.9,0.40":1,"entertainment|0.80,0.20":2,"school|0.70,0.8":1,"smarthome|0.15,0.80":1,"smartoffice|0.1,0.30":1,"school|0.7,0.70":1,"workstation|0.5,0.45":1,"smartoffice|0.75,0.5":2,"audiovideo|0.8,0.20":1,"mobilethinkpad|0.8,0.50":1,"smartpc|0.9,0.70":1,"workstation|0.55,0.55":1,"mobilethinkpad|0.70,0.55":1,"entertainment|0.30,0.5":2,"audiovideo|0.8,0.25":1,"smartoffice|0.4,0.6":1,"entertainment|0.85,0.3":2,"school|0.7,0.25":2,"mobilethinkpad|0.9,0.55":1,"entertainment|0.35,0.5":1,"mobilethinkpad|0.65,0.7":1,"entertainment|0.00,0.5":1,"smarthome|0.9,0.25":3,"mobilethinkpad|0.2,0.20":1,"workstation|0.15,0.85":2,"commercialiot|0.9,0.55":1,"smartpc|0.20,0.30":5,"school|0.15,0.60":1,"workstation|0.4,0.40":1,"smarthome|0.8,0.25":4,"smarthome|0.4,0.50":1,"audiovideo|0.10,0.65":1,"school|0.60,0.60":1,"smarthome|0.40,0.4":2,"smarthome|0.85,0.7":1,"commercialiot|0.10,0.7":1,"school|0.60,0.5":1,"school|0.25,0.60":2,"smartpc|0.15,0.75":2,"mobilethinkpad|0.70,0.8":1,"school|0.20,0.6":2,"commercialiot|0.10,0.60":2,"workstation|0.3,0.60":1,"entertainment|0.9,0.50":1,"commercialiot|0.35,0.80":1,"workstation|0.00,0.25":3,"workstation|0.15,0.20":2,"workstation|0.95,0.30":3,"workstation|0.40,0.20":2,"school|0.65,0.70":1,"school|0.35,0.50":1,"smartpc|0.05,0.70":1,"commercialiot|0.2,0.50":1,"audiovideo|1,0.3":2,"smartpc|0.10,0.70":1,"smartpc|0.35,0.7":1,"smartpc|0.00,0.70":2,"smartpc|0.1,0.55":3,"smartpc|0.25,0.6":1,"smartpc|0.65,0.85":1,"mobilethinkpad|0.05,0.7":1,"smartpc|0.5,0.55":1,"audiovideo|0.70,0.7":1,"school|0.30,0.45":1,"school|0.40,0.75":1,"school|0.7,0.7":1,"audiovideo|0.1,0.8":1,"workstation|0.70,0.3":6,"smartoffice|0.20,0.20":1,"smarthome|0.5,0.30":1,"smartoffice|0.60,0.7":1,"entertainment|0,0.45":1,"school|0.00,0.70":3,"school|0.6,0.70":1,"school|0.30,0.65":3,"school|0.40,0.50":3,"smartoffice|0.9,0.45":2,"commercialiot|0.7,0.55":3,"workstation|0.7,0.30":4,"smarthome|0.80,0.4":2,"workstation|0.30,0.6":1,"audiovideo|0.15,0.7":1,"commercialiot|0.7,0.65":2,"smartoffice|0.5,0.30":1,"smartpc|0.25,0.3":2,"mobilethinkpad|0.45,0.15":1,"workstation|0.60,0.65":1,"smartpc|0.95,0.7":1,"commercialiot|0.25,0.7":1,"smarthome|0.90,0.5":1,"mobilethinkpad|0.8,0.60":1,"mobilethinkpad|0.05,0.3":5,"workstation|0.60,0.60":1,"workstation|0.9,0.60":1,"smarthome|0.1,0.60":1,"gaming|0.80,0.6":1,"workstation|0.7,0.3":1,"smartoffice|0.8,0.80":1,"commercialiot|0.40,0.7":2,"smarthome|0.80,0.6":1,"smarthome|0.50,0.5":1,"mobilethinkpad|0.6,0.65":1,"audiovideo|0.80,0.5":1,"smartoffice|0.00,0.6":1,"smarthome|0.45,0.6":1,"mobilethinkpad|0.80,0.5":3,"smartoffice|0.50,0.6":1,"audiovideo|0.55,0.3":1,"mobilethinkpad|0.00,0.25":3,"smartpc|0.9,0.45":1,"mobilethinkpad|0.70,0.5":1,"smartoffice|0.6,0.75":1,"mobilethinkpad|0.1,0.3":1,"workstation|0.6,0.50":1,"entertainment|0.70,0.55":1,"mobilethinkpad|0.10,0.3":3,"workstation|0.1,0.70":1,"smartoffice|0.75,0.7":1,"commercialiot|0.20,0.90":1,"mobilethinkpad|0.50,0.8":2,"mobilethinkpad|0.55,0.7":3,"audiovideo|0.60,0.3":1,"workstation|0.45,0.7":7,"workstation|0.50,0.20":1,"smartoffice|0.1,0.25":3,"smartpc|0.3,0.25":1,"workstation|0.55,0.20":1,"workstation|0.05,0.6":1,"workstation|0.45,0.65":14,"workstation|0.70,0.70":2,"audiovideo|0.7,0.65":1,"audiovideo|0.10,0.5":1,"commercialiot|0.30,0.20":1,"gaming|0.45,0.80":3,"smartoffice|0.15,0.3":1,"audiovideo|0.6,0.30":6,"smartpc|0.5,0.3":1,"smarthome|0.70,0.7":1,"smartoffice|0.00,0.25":3,"entertainment|0.1,0.4":3,"audiovideo|0.55,0.5":1,"smarthome|0.45,0.7":1,"smartoffice|0.25,0.80":1,"smarthome|0.75,0.65":3,"smartpc|0.00,0.65":2,"school|0.85,0.8":1,"commercialiot|0.6,0.45":1,"audiovideo|0.90,0.8":1,"mobilethinkpad|0.5,0.40":1,"workstation|0.70,0.7":1,"smarthome|0.8,0.3":3,"audiovideo|0.90,0.7":1,"smartpc|0.5,0.7":1,"smarthome|0.75,0.2":1,"commercialiot|0.15,0.8":2,"commercialiot|0.65,0.80":1,"smartpc|0.95,0.20":2,"commercialiot|0.50,0.4":2,"audiovideo|0.55,0.80":1,"smarthome|0.70,0.20":16,"smarthome|0.5,0.25":1,"mobilethinkpad|0.5,0.3":2,"smarthome|0.6,0.20":2,"mobilethinkpad|0.00,0.6":1,"smartoffice|0.2,0.75":1,"school|0.60,0.50":1,"workstation|0.20,0.7":1,"school|0.50,0.3":2,"workstation|0.8,0.70":1,"workstation|0.7,0.4":1,"workstation|0.8,0.60":1,"workstation|0.8,0.65":1,"audiovideo|0.95,0.85":1,"smartoffice|0.45,0.45":2,"smartpc|0.65,0.6":1,"audiovideo|0.90,0.80":10,"gaming|0.7,0.6":1,"smarthome|0.7,0.20":15,"smartpc|0.4,0.30":4,"gaming|1,0.75":1,"gaming|0.90,0.85":1,"gaming|0.6,0.50":5,"workstation|0.2,0.40":1,"commercialiot|0.50,0.60":6,"school|0.40,0.4":2,"commercialiot|0.15,0.70":1,"smartpc|0.8,0.50":1,"mobilethinkpad|0.2,0.80":1,"commercialiot|0.40,0.80":1,"school|0.30,0.85":1,"smartpc|0.65,0.4":3,"commercialiot|0.90,0.6":1,"school|0.30,0.80":1,"school|0.50,0.7":1,"smarthome|0.3,0.55":1,"workstation|0.50,0.65":1,"mobilethinkpad|0.65,0.4":2,"smarthome|0.5,0.20":1,"commercialiot|1,0.20":4,"smartpc|0.90,0.5":1,"school|0.70,0.75":1,"mobilethinkpad|0.00,0.7":1,"school|0.40,0.20":6,"smarthome|0.80,0.20":1,"school|0.4,0.25":3,"smartpc|0.30,0.75":2,"mobilethinkpad|0.30,0.80":1,"commercialiot|0.80,0.60":3,"commercialiot|0.8,0.60":1,"commercialiot|0.65,0.75":1,"audiovideo|0.3,0.60":1,"school|0.25,0.7":1,"smarthome|0.35,0.7":1,"school|0.95,0.4":1,"workstation|0.10,0.55":1,"school|0.1,0.20":2,"commercialiot|0.6,0.55":1,"commercialiot|0.40,0.3":1,"school|0.30,0.20":13,"smarthome|0.5,0.60":2,"mobilethinkpad|0.8,0.6":1,"mobilethinkpad|0.8,0.75":1,"mobilethinkpad|0.55,0.5":1,"school|0.40,0.7":1,"mobilethinkpad|0.5,0.45":1,"commercialiot|0.7,0.4":1,"school|0.55,0.70":1,"smartoffice|0.8,0.70":1,"school|0.10,0.75":1,"commercialiot|0.15,0.90":1,"school|0.05,0.65":4,"workstation|0.10,0.70":1,"workstation|0.10,0.60":1,"school|0.10,0.55":5,"commercialiot|1,0.25":1,"school|0.05,0.6":3,"commercialiot|0.2,0.75":1,"commercialiot|0.1,0.50":1,"smarthome|0.5,0.70":1,"school|0.5,0.4":2,"smartoffice|0.00,0.5":1,"school|0.8,0.45":1,"workstation|0.5,0.80":1,"school|0.35,0.20":11,"smartoffice|0.1,0.60":1,"smartoffice|0.80,0.25":1,"school|0.8,0.25":2,"smarthome|0.1,0.40":1,"entertainment|0.3,0.60":1,"audiovideo|0.20,0.70":1,"mobilethinkpad|0.30,0.4":1,"workstation|0.9,0.6":1,"smarthome|0.70,0.55":1,"entertainment|0.00,0.95":3,"mobilethinkpad|0.15,0.3":1,"smarthome|0.20,0.6":1,"audiovideo|0.00,0.20":1,"gaming|0.5,0.65":1,"mobilethinkpad|0.55,0.60":1,"audiovideo|0.90,0.85":7,"gaming|0.90,0.90":1,"smartoffice|0.50,0.4":1,"school|0.1,0.2":1,"workstation|0.30,0.7":6,"smartoffice|0.75,0.3":1,"smartoffice|0.5,0.40":1,"smartoffice|0.55,0.6":1,"gaming|0.25,0.4":2,"mobilethinkpad|0.4,0.40":1,"mobilethinkpad|0.15,0.5":1,"mobilethinkpad|0.6,0.75":1,"audiovideo|0.9,0.85":1,"gaming|0.25,0.20":17,"workstation|0.55,0.4":1,"gaming|0.1,0.45":3,"gaming|0.85,0.5":1,"entertainment|0.15,0.65":1,"audiovideo|0.2,0.55":1,"entertainment|0.1,0.65":1,"smarthome|0.55,0.90":1,"commercialiot|0.75,0.65":1,"audiovideo|0.3,0.50":1,"smartpc|1,0.40":1,"mobilethinkpad|0.60,0.70":1,"smartpc|0.20,0.70":1,"gaming|0.50,0.75":1,"gaming|0.25,0.5":1,"mobilethinkpad|0.4,0.80":1,"gaming|0.40,0.70":1,"mobilethinkpad|0.55,0.80":1,"mobilethinkpad|0.4,0.65":3,"workstation|0.40,0.6":1,"mobilethinkpad|0.05,0.20":21,"smartoffice|0.80,0.90":1,"smartoffice|0.3,0.70":2,"smartoffice|0.90,0.80":1,"school|0.10,0.15":1,"gaming|0.3,0.7":1,"mobilethinkpad|0.45,0.90":1,"school|0.10,0.2":1,"gaming|0.5,0.60":1,"smartoffice|0.4,0.4":1,"audiovideo|0.6,0.25":1,"smarthome|0.50,0.90":28,"audiovideo|0.9,0.45":3,"commercialiot|0.9,0.2":1,"smarthome|0.15,0.7":1,"smarthome|0.50,0.95":9,"school|0.4,0.20":1,"gaming|0.90,0.7":2,"mobilethinkpad|0.4,0.7":1,"audiovideo|0.85,0.7":1,"smartoffice|0.5,0.75":1,"entertainment|0.3,0.70":1,"audiovideo|0.6,0.3":1,"school|0.3,0.20":1,"audiovideo|0,0.65":1,"gaming|0.9,0.80":1,"mobilethinkpad|0.4,0.85":1,"mobilethinkpad|0.30,0.60":1,"smarthome|0.50,0.4":1,"smartpc|1,0.30":1,"mobilethinkpad|0.50,0.75":1,"mobilethinkpad|0.5,0.80":1,"school|0.45,0.5":1,"smarthome|0.75,0.7":1,"gaming|0.20,0.90":1,"audiovideo|0.30,0.85":1,"workstation|0.80,0.8":1,"smarthome|0.20,0.20":1,"smarthome|0.20,0.4":1,"gaming|0.55,0.85":1,"commercialiot|0.80,0.2":2,"smartoffice|0.40,0.80":1,"audiovideo|0.50,0.4":2,"smartoffice|0.50,0.75":1,"mobilethinkpad|0.35,0.60":1,"mobilethinkpad|0.35,0.65":1,"commercialiot|0.3,0.45":1,"gaming|0.00,0.25":2,"gaming|0.3,0.4":2,"gaming|0.40,0.3":2,"mobilethinkpad|0.9,0.75":1,"gaming|0.80,0.80":1,"gaming|0.40,0.4":1,"smartoffice|0.50,0.8":1,"smartoffice|0.5,0.8":1,"smartoffice|0.5,0.80":1,"mobilethinkpad|0.2,0.70":1,"smartoffice|0.50,0.60":1,"smartoffice|0.3,0.60":1,"mobilethinkpad|0.15,0.70":1,"audiovideo|0.60,0.70":1,"gaming|0.55,0.7":10,"commercialiot|0.4,0.4":1,"smarthome|0.50,1":1,"smartoffice|0.20,0.3":1,"smartoffice|0.2,0.3":1,"smartpc|0.5,0.40":1,"smartoffice|0.2,0.4":1,"school|0.2,0.2":1,"smartpc|0.50,0.40":1,"mobilethinkpad|0.8,0.55":1,"smartoffice|0.2,0.40":1,"gaming|0.50,0.5":1,"audiovideo|0.9,0.80":1,"smarthome|0.3,0.70":1,"smartoffice|0.9,0.85":1,"smartoffice|0.25,0.5":2,"workstation|0.05,0.20":1,"smartoffice|0.50,0.50":1,"workstation|0.35,0.20":1,"gaming|0.40,0.5":1,"smartoffice|0.30,0.5":1,"smartoffice|0.45,0.90":1}';
        let data = JSON.parse(tt);
        let maxNum = (new Date().getDate()-11)*300;
        for(let key in data){
          data[key] = data[key]>maxNum?maxNum:data[key];
        }
        this.hisTotalData  = data;
        this.setInstanceData();
      },
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
        let ttdata = normalization(this.hisTotalData);
        // let ttdata = this.hisTotalData;
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
            radius: dar.f / 10 * this.fireObject.w
          };
          points.push(point);
        }
        this.heatmapInstance.setData({
          max: max,
          data: points
        });

        function normalization(data) {
          let returnObj = {};
          let maxNum = (new Date().getDate()-12)*150;
          for(let key in data){
            returnObj[key] = data[key]>maxNum?maxNum:data[key];
          }

          return returnObj;
        }

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
        this.his_socket = new WebSocket('ws://10.110.131.249:9003/'); //History_booth_heat
        this.his_socket.onmessage = this.his_onMessage;
        this.his_socket.onclose = this.his_onClose;
        this.his_socket.onopen = this.his_onOpen;

      },
      his_initSocket2() {
        this.his_socket2 = new WebSocket('ws://10.110.131.249:8002/'); //History_booth_heat
        this.his_socket2.onclose = this.his_onClose2;
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
        let _this = this;
        setTimeout(_this.his_initSocket,3000);
      },
      his_onClose2(){
        console.log('socket2 is closed');
        let _this = this;
        setTimeout(_this.his_initSocket2,3000);
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
