<template>
  <div>
    <!--<h1 ref="numberGrow" :data-time="time" :data-value="value">0</h1>-->
    <h1 class="title">今日访客人数</h1>
    <div class="rows" ref="rows">
      <div class="row" v-for="item in counte_rows" :key="item" :ref="item" :rownum="item">
        <div class="cell">
          <div class="text">0</div>
        </div>
        <div class="cell">
          <div class="text">1</div>
        </div>
        <div class="cell">
          <div class="text">2</div>
        </div>
        <div class="cell">
          <div class="text">3</div>
        </div>
        <div class="cell">
          <div class="text">4</div>
        </div>
        <div class="cell">
          <div class="text">5</div>
        </div>
        <div class="cell">
          <div class="text">6</div>
        </div>
        <div class="cell">
          <div class="text">7</div>
        </div>
        <div class="cell">
          <div class="text">8</div>
        </div>
        <div class="cell">
          <div class="text">9</div>
        </div>
      </div>

    </div>

  </div>

</template>

<style lang="scss" scoped>
  .rows {
    display: flex;
    padding: 1px 2px 1px 1px;
    width: 100%;
  }

  .row {
    height: 50px;
    width: 70px;
    position: relative;
  }

  .row:before, .row:after {
    bottom: 0;
    content: '';
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 35%;
    z-index: 1;
  }

  .row:before {
    background: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, 0.5)), to(rgba(0, 0, 0, 0)));
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
    left: 0;
  }

  .row:after {
    background: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 0.5)));
    background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
    right: 0;
  }

  .cell {
    background: linear-gradient(45deg, #0d0d0d, #262626);
    -webkit-box-shadow: inset 0 0 0 1px #000, inset 0 0 0 2px #383838;
    box-shadow: inset 0 0 0 1px #000, inset 0 0 0 2px #383838;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 50px;
    position: relative;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    width: 70px;
  }

  .cell:before {
    background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/836/noise.jpg);
    background-size: 256px 256px;
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0.08;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }

  .cell:after {
    background: radial-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
    -webkit-transition-duration: 200ms;
    transition-duration: 200ms;
    -webkit-transition-property: opacity;
    transition-property: opacity;
    z-index: 2;
  }

  .row:hover .cell:after {
    opacity: 1;
    -webkit-transition-duration: 64ms;
    transition-duration: 64ms;
  }
</style>

<script>
  import 'flickity/dist/flickity.min.css'
  import flickity from 'flickity'
  import {Howl, Howler} from 'howler';

  export default {
    data() {
      return {
        flktyObject: {},
        counte_rows: ['tenthousands','thousands','hundreds','tens','ones'],
        sound: undefined,
      }
    },

    props: {
      time: {
        type: Number,
        default: 2
      },
      value: {
        type: Number,
        default: 0
      }
    },
    watch: {
      value(newV,oldV){
        this.onChange();
      }
    },
    methods: {
      numberGrow(ele) {
        let _this = this;
        let step = (_this.value * 10) / (_this.time * 1000);
        let current = 0;
        let start = 0;
        let t = setInterval(function () {
          start += step;
          if (start > _this.value) {
            clearInterval(t);
            start = _this.value;
            t = null
          }
          if (current === start) {
            return
          }
          current = start.toFixed(0);
          // ele.innerHTML = current.toString().replace(/(\d)(?=(?:\d{3}[+]?)+$)/g, '$1,')    //加逗号分割版
          ele.innerHTML = current.toString();
        }, 10)
      },
      setupFlickity() {
        var rows = this.$refs.rows.children;
        for (let i = 0, len = rows.length; i < len; i++) {
          let row = rows[i];
          let flkty = new flickity(row, {
            selectedAttraction: 0.95,//滑块的速度
            friction: 1,//滑块的振幅
            cellAlign: 'center',//位置
            pageDots: false,//小原点
            wrapAround: true,//是否环绕
            prevNextButtons: false
          });
          flkty.lastIndex = 0;
          this.flktyObject[row.getAttribute('rownum')] = flkty;
        }
        this.onChange();
      },
      onChange() {
        let valueArray = this.value.toString().split('').reverse();//反转按个十百千排列
        for(let i=0;i<valueArray.length;i++){
          let rowflkty = this.flktyObject[this.counte_rows[this.counte_rows.length-1-i]];
          rowflkty.select(valueArray[i]);
          // this.sound.play();
        }
      },
      test: function () {
        this.flktyObject['hundreds'].next();
      }
    },

    mounted() {
      this.sound = new Howl({
        src: ['../../static/misc/lock-button.mp3', '../../static/misc/lock-button.ogg'],
        volume: 0.5,
        rate: 1
      });
      // this.numberGrow(this.$refs.numberGrow);
      this.setupFlickity();

    },

  }
</script>
