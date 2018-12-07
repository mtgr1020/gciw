<template>
  <div>
    <header>
      <el-row type="flex" class="pg-head" justify="space-around">
        <el-col :span="6">
          <span class="pg-title">{{ pgtime }}</span>
        </el-col>
        <el-col :span="6">
          <h3 class="pg-title">LEFACE服务平台</h3>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
    </header>
    <section>
      <el-row type="flex" justify="space-around">
        <el-col :span="4">
          <div>
            <p style="margin-top: 20px;color: white;word-break: break-word;">
              热力图数据处理:<br/>&nbsp&nbsp
              1.数据拿到(区域+人坐标)，如果是相对于区域的坐标进行换算，例配置区域1坐标为（200，100），那这个区域对应点就是（（200+x），（100-y）），赋值坐标位置；<br/>&nbsp&nbsp
              2.根据区域进行数值排序，分级设置每个区域对应的value值，以便后期进行绘色，对于颜色区间可以固定值也可以动态分级（绝对热度，相对热度）。<br/>&nbsp&nbsp
              3.数据整合，绘制热度图。
            </p>
          </div>
        </el-col>
        <el-col :span="14">
          <div ref="heatmap" class="pg-heatmap" @click="mockAddData"></div>
          <div class="pg-map-config">
            <div>
              <h4>热力图配置</h4>
              <el-button type="primary" plain size="mini" style="float: right;margin-left: 10px;" @click="configureMap">
                重新生成
              </el-button>
              <el-button type="primary" plain size="mini" style="float: right" @click="pauseMap">{{
                pauseFalg?'暂停...':'暂停' }}
              </el-button>
              <el-button type="primary" plain size="mini" style="float: right" @click="repaintMap">重置画布</el-button>
              <el-button type="primary" plain size="mini" style="float: right" @click="getMapImg">截取热力图</el-button>
              <el-button type="primary" plain size="mini" style="float: right" @click="addDataFlag = !addDataFlag">
                {{ addDataFlag?'关闭模拟添加':'开启鼠标模拟添加' }}
              </el-button>
            </div>
            <div class="pg-map-form">
              <el-form :inline="true" :model="configMap">
                <el-form-item label="数据点半径">
                  <el-input-number v-model="configMap.radius" :min="1" :max="100" :step="5"
                                   size="small"></el-input-number>
                </el-form-item>
                <el-form-item label="最低值的最小不透明度">
                  <el-input-number v-model="configMap.minOpacity" :min="0" :max="1" :step="0.1"
                                   size="small"></el-input-number>
                </el-form-item>
                <el-form-item label="最高值的最大不透明度">
                  <el-input-number v-model="configMap.maxOpacity" :min="0" :max="1" :step="0.1"
                                   size="small"></el-input-number>
                </el-form-item>
                <el-form-item label="模糊因子">
                  <el-input-number v-model="configMap.blur" :min="0" :max="1" :step="0.1"
                                   size="small"></el-input-number>
                </el-form-item>
                <el-form-item label="颜色选择器">
                  <div style="display: flex">
                    <div v-for="(item,index) in pickColor" :key="index">
                      {{ item.value }}
                      <el-slider
                        v-model="item.value"
                        vertical
                        height="100px"
                        @change="computedPick"
                      >
                      </el-slider>
                      <el-color-picker
                        v-model="item.color"
                        show-alpha
                        :predefine="predefineColors"
                        @change="computedPick"
                      >
                      </el-color-picker>
                    </div>
                  </div>
                </el-form-item>

              </el-form>


            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div ref="curveChart" class="pg-curveChart"></div>
          <div class="pg-history">
            <div class="pg-history-title">
              <h3>展区热度总排名</h3>
              <span>Show area heat total ranking</span>
            </div>
            <div class="pg-history-table">
              <table>
                <thead>
                <tr>
                  <th>展区</th>
                  <th>历史总计</th>
                  <th>今日人数</th>
                  <th>热度</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in historyRank" :key="item.name">
                  <td>{{ item.name }}</td>
                  <td>{{ item.total }}</td>
                  <td>{{ item.today }}</td>
                  <td>
                    <i class="fa fa-star" v-for="hotitem in item.hot"></i>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <img :src="imgBase64" style="width: 90%;padding: 10px;"/>
        </el-col>
      </el-row>
    </section>


  </div>

</template>

<script>
  import h337 from 'heatmap.js'

  export default {
    data() {
      return {
        heatmapInstance: undefined,
        pgtime: '',
        configMap: {
          radius: 40,
          maxOpacity: .5,
          minOpacity: 0,
          blur: .75,
          gradient: {
            '.5': 'rgba(30, 144, 255, 1)',
            '.8': 'rgba(250, 212, 0, 1)',
            '.95': 'rgba(255, 69, 0, 1)'
          }
        },
        timeOut: undefined,
        pickColor: [
          {
            value: 50,
            color: 'rgba(30, 144, 255, 1)'
          },
          {
            value: 80,
            color: 'rgba(250, 212, 0, 1)'
          }, {
            value: 95,
            color: 'rgba(255, 69, 0, 1)'
          }
        ],
        predefineColors: [
          '#ff4500',
          '#ff8c00',
          '#ffd700',
          '#90ee90',
          '#00ced1',
          '#1e90ff',
          '#c71585',
          'rgba(255, 69, 0, 0.68)',
          'rgb(255, 120, 0)',
          'hsv(51, 100, 98)',
          'hsva(120, 40, 94, 0.5)',
          'hsl(181, 100%, 37%)',
          'hsla(209, 100%, 56%, 0.73)',
          '#c7158577'
        ],
        imgBase64: '',
        addDataFlag: false,
        pauseFalg: false,
        addData: [],
        historyRank:[{
          name: '5号展厅',
          total: 2301,
          today: 348,
          hot: 5
        },{
          name: '12号展厅',
          total: 2191,
          today: 301,
          hot: 5
        },{
          name: '1号展厅',
          total: 1827,
          today: 390,
          hot: 4
        },{
          name: '8号展厅',
          total: 1405,
          today: 532,
          hot: 4
        },{
          name: '2号展厅',
          total: 1298,
          today: 234,
          hot: 3
        }],
        counter: 999,
      }
    },
    watch: {},
    mounted() {
      setInterval(()=>{
        this.counter = this.counter + Math.floor(Math.random()*10);
      },2000);
      this.$nextTick(function () {
        this.initMap();
        this.initClock();
        this.initCharts();
      });
    },
    methods: {
      initCharts: function () {
        const myChart = echarts.init(this.$refs.curveChart);

        function randomData() {
          now = new Date(+now + oneDay);
          value = value + Math.random() * 21 - 10;
          return {
            name: now.toString(),
            value: [
              now.getTime(),
              Math.round(value)
            ]
          }
        }
        function randomData2() {
          now = new Date(+now + oneDay);
          value2 = value2 + Math.random() * 31 - 13;
          return {
            name: now.toString(),
            value: [
              now.getTime(),
              Math.round(value2)
            ]
          }
        }

        let data1 = [];
        let data2 = [];
        let now = +new Date();
        let oneDay = 1000;
        let value = Math.random() * 500;
        let value2 = Math.random() * 200;
        for (let i = 0; i < 60; i++) {
          data1.push(randomData());
          data2.push(randomData2());
        }

        let option = {
          title: {
            text: '展区实时热度统计(前三)',
            subtext: 'Real-time display map (top 3)',
            textStyle: {
              color: '#fff'
            },
            subtextStyle: {
              color: '#fff'
            }
          },
          legend: {
            type: 'plain',
            orient: 'vertical',
            right: '30',
            textStyle: {
              color: '#fff'
            },
            data: [
              '一号展厅',
              '五号展厅'
            ]
          },
          // tooltip: {
          //   trigger: 'axis',
          //   formatter: function (params) {
          //     params = params[0];
          //     var date = new Date(params.name);
          //     return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' : ' + params.value[1];
          //   },
          //   axisPointer: {
          //     animation: false
          //   }
          // },
          xAxis: {
            type: 'time',
            splitLine: {
              show: false
            }
          },
          yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
              show: false
            }
          },
          series: [{
            name: '一号展厅',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            itemStyle: {
              color: 'blue'
            },
            data: data1
          }, {
            name: '五号展厅',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: data2
          }]
        };

        setInterval(function () {

          // for (let i = 0; i < 1; i++) {
          data1.shift();
          data1.push(randomData());
          data2.shift();
          data2.push(randomData2());
          // }

          myChart.setOption({
            series: [{
              data: data1
            },{
              data: data2
            }]
          });
        }, 1000);
        myChart.setOption(option);
      },
      computedPick: function () {
        this.configMap.gradient = {};
        this.pickColor.forEach((obj) => {
          let valueStr = obj.value.toString();
          let keys = valueStr.charAt(valueStr.length - 1) === '0' ? valueStr.substr(0, 1) : valueStr;
          this.configMap.gradient['.' + keys] = obj.color;
        })
      },
      initClock: function () {
        setTimeout(() => {
          this.pgtime = moment().format('MMMM Do YYYY, h:mm:ss a');
          this.initClock();
        }, 1000)
      },
      initMap: function () {
        this.configMap.container = this.$refs.heatmap;
        this.heatmapInstance = h337.create(this.configMap);
        this.configureMap();
      },
      configureMap: function () {
        if (this.timeOut !== undefined) {
          clearTimeout(this.timeOut);
        }
        this.pauseFalg = false;
        this.heatmapInstance.configure(this.configMap);
        this.updateMap();
      },
      updateMap: function () {
        this.timeOut = setTimeout(() => {
          let points = [];
          let max = 0;

          let width = this.$refs.heatmap.clientWidth;
          let height = this.$refs.heatmap.clientHeight;
          let len = 300;

          while (len--) {
            let val = Math.floor(Math.random() * 100);

            let radius = this.configMap.radius;

            max = Math.max(max, val);
            let point = {
              x: Math.floor(Math.random() * width),
              y: Math.floor(Math.random() * height),
              value: val,
              radius: radius
            };
            points.push(point);
          }
          for (let i = 0; i < this.addData.length; i++) {
            max = max > this.addData[i].value ? max : this.addData[i].value;
            points.push(this.addData[i]);
          }
          let data = {
            max: max,
            data: points
          };
          this.heatmapInstance.setData(data);
          this.updateMap();
        }, 1000)
      },
      pauseMap: function () {
        if (this.timeOut !== undefined) {
          this.pauseFalg = true;
          clearTimeout(this.timeOut);
        }
      },
      repaintMap: function () {
        this.heatmapInstance.repaint();
      },
      getMapImg: function () {
        this.imgBase64 = this.heatmapInstance.getDataURL();
        console.log(this.imgBase64);
      },
      mockAddData: function ($event) {
        if (this.addDataFlag) {
          let ev = $event;
          if (this.pauseFalg) {
            //下方其实才是真正的添加数据，但是由于我们setData时会抹去这些数据 所以把数据放在vue中存储起来
            this.heatmapInstance.addData({
              x: ev.layerX,
              y: ev.layerY,
              value: Math.floor(Math.random() * 100),
              radius: this.configMap.radius
            });
          } else {
            this.addData.push({
              x: ev.layerX,
              y: ev.layerY,
              value: 100,
              radius: this.configMap.radius
            });
          }

        }
      }
    },
    components: {

    }
  }
</script>

<style lang="scss" scoped>
  .pg-head {
    height: 50px;
    border-bottom: solid 1px #023326;
    text-align: center;
    .pg-title {
      line-height: 50px;
    }
    h3 {
      color: #1FA2E4;
    }
    span {
      color: #fff;
    }
  }

  .pg-heatmap {
    width: 100%;
    height: 600px;
    margin-top: 20px;
    /*background-image: url("../assets/img/bg.jpg");*/
  }

  .pg-map-config {
    margin-top: 15px;
    padding: 20px;
    background-color: #fff;
    h4 {
      display: inline-block;
      border-top: solid 1px #023326;
      border-bottom: solid 1px #023326;
      background-color: rgba(154, 199, 242, 1);
    }
    .pg-map-form {
      margin-top: 10px;
    }
  }

  .pg-curveChart {
    width: 100%;
    height: 300px;
    margin-top: 20px;
  }

  .pg-history{
    padding: 10px;
    color: #fff;
    .pg-history-title{
      span{
        font-size: 12px;
      }
    }
    .pg-history-table{
      table{
        border-collapse:collapse;
        text-align: center;
        width: 100%;
        th,td{
          border-bottom: solid 1px #797979;
          height:35px;
          vertical-align:middle;
          font-size: 14px;
          width: 25%;
          i{
            color: red;
          }
        }
        th{
          color: #797979;
        }
      }
    }
  }
</style>
