<template>
  <div class="container">
    <!--<button @click="addEnter">TEST ENTER</button>-->
    <!--<button @click="addLuck">TEST LUCK</button>-->
    <div ref="enterEl">
      <div class="enter">
        <div class="head-portrait-list" ref="headList">
          <div v-for="(item,index) in enterAudience" :key="index" class="head-warp">
            <img :src="'data:image/png;base64,'+enterBase64[index]"/>
            <p>{{ item }}号观众</p>
          </div>

          <div class="head-warp" style="width: 0px;height: 0px">
            <img :src="'data:image/png;base64,'+enterLastBase64"/>
          </div>
        </div>
      </div>

      <div class="exhibition">
        <h1>幸运抽奖</h1>
        <h2>尾号为88的观众将获得幸运大奖</h2>
      </div>
    </div>


    <div class="selected" ref="selectEl" style="display: none">
      <div class="sel-head">
        <div class="sel-head-img" ref="headImg">
          <img :src="'data:image/png;base64,'+luckNumberBase"/>
        </div>
      </div>
      <div class="sel-font">
        <p>{{ luckNum }}号观众</p>
        <p>恭喜您成为第<span>{{ luckLocation }}</span>位幸运儿</p>
        <p>请联系工作人员领取幸运大奖</p>
      </div>
    </div>


    <div class="luck-wrap">
      <div class="logo-wrap">
        <img src="../assets/img/lucklogo.png"/>
      </div>
      <div class="luck-head" ref="luckEl">
        <div class="img-wrap" v-for="(item,index) in luckAudience" :key="index">
          <div class="po-wrap">
            <img :src="'data:image/png;base64,'+luckBase64[index]"/>
            <p>{{ item }}号观众</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        enterAudience: [],
        pendingEnter: [],
        enterBase64: [],
        enterLastBase64: '',
        luckAudience: [],
        luckBase64: [],
        totalLuckAudience: [],
        totleBase64: [],
        showIndex: 0,
        luckNum: 0,
        luckNumberBase: '',
        luckScroll: false,
        enterScroll: false,
        excuteEnterFlag: false,
        luckIntervalInstance: undefined,
      }
    },
    computed: {
      luckLocation: function () {
        return (this.luckNum - 88) / 100 + 1;
      }
    },
    watch: {
      totalLuckAudience: function (newV, oldV) {
        let _this = this;
        if (newV.length > 9 && !this.luckScroll) {
          _this.luckScroll = true;
          _this.computeLuckAud();
          _this.$nextTick(_this.renderLuck);
        }
      },
      enterAudience: function (newV, oldV) {
        if (newV.length === 2 && !this.enterScroll) {
          this.enterScroll = true;
          this.$nextTick(this.renderEnter);
        }
      },
      luckAudience: function (n, o) {
        console.log(n, o)
      }
    },
    mounted() {
      this.$nextTick(function () {
        this.initSocket();
        this.luckAmEnd();
      });
      let _this = this;
      window.addEventListener('unload', function () {
        _this.destory();
      });
      window.addEventListener('beforeunload', function () {
        _this.destory();
      });

      // setInterval(function () {
      //   _this.pendingEnter.push(...[{number: 86}, {number: 87}, {number: 88}, {number: 89}, {number: 90}, {number: 91}, {number: 92}, {number: 93},{number: 89}, {number: 90}, {number: 91}, {number: 92}, {number: 93}]);
      //   if (!_this.excuteEnterFlag) {
      //     _this.addEnter();
      //   }
      // }, 2000);
    },
    methods: {
      /**
       * 初始化 websocket连接
       */
      initSocket() {
        this.socket = new WebSocket('ws://10.110.131.251:9003/'); //History_booth_heat
        this.socket.onmessage = this.onMessage;
        this.socket.onclose = this.onClose;
        this.socket.onopen = this.onOpen;
      },
      destory() {
        this.socket.send('disconnect');
      },
      onMessage(ev) {
        // console.log(ev.data);
        let response = eval('(' + ev.data + ')');
        let key = Object.keys(response)[0];
        switch (key) {
          case 'Guest_number':
            this.pendingEnter.push(...response['Guest_number']);
            console.log(this.excuteEnterFlag);
            if (!this.excuteEnterFlag) {
              this.addEnter();
            }
            break;
          case 'Winning':
            let winning = response['Winning'];
            let la = [];
            winning.forEach(item => {
              la.push(item.number);
              this.totleBase64.push(item.img);
            });
            this.totalLuckAudience = [].concat(la);
            if (this.totalLuckAudience < 10) {
              this.computeLuckAud();
            }else {
              let _this = this;
              this.luckIntervalInstance = setInterval(_this.addLuck, 3000);
            }
            this.socket.send('Guest_number');//来宾
            break;
          default:
        }

      },
      onOpen() {
        this.socket.send('Winning');//来宾
      },
      onClose() {
        console.log('socket is closed');
      },
      computeLuckAud: function () {
        if (this.totalLuckAudience.length > 9) {
          this.luckAudience = this.totalLuckAudience.slice(this.showIndex, this.showIndex + 9);
          this.luckBase64 = this.totleBase64.slice(this.showIndex, this.showIndex + 9);
          if (this.totalLuckAudience.length === this.showIndex) {
            this.showIndex = 0;
          } else {
            this.showIndex++;
          }
          if (this.luckAudience.length < 9) {
            this.luckAudience.push(...this.totalLuckAudience.slice(0, 9 - this.luckAudience.length));
            this.luckBase64.push(...this.totleBase64.slice(0, 9 - this.luckBase64.length));
          }
        } else {
          this.luckAudience = [].concat(this.totalLuckAudience);
          this.luckBase64 = [].concat(this.totleBase64);
        }
      },
      addLuck: function () {
        if (this.totalLuckAudience.length < 10) {
          this.computeLuckAud();
        } else {
          let listEl = this.$refs.luckEl;
          let firstElWrap = listEl.firstChild;
          let firstElImg = listEl.firstChild.firstChild.firstChild;
          firstElImg.nextElementSibling.style.display = "none";
          listEl.classList.add('moveLuckAnimation');
          firstElWrap.classList.add('leaveLuckAnimation');
          firstElImg.classList.add('leaveLuckAnimation');
        }
      },
      //注册幸运左右滚动动画完成 清除了原绑定的动画 同时重新计算模版需绑定的值
      renderLuck: function () {
        let listEl = this.$refs.luckEl;
        let firstElWrap = listEl.firstChild;
        let _this = this;
        let firstElImg = listEl.firstChild.firstChild.firstChild;
        listEl.addEventListener("webkitAnimationEnd", function (e) { //动画结束时事件 
          if (e.target === e.currentTarget) {
            listEl.classList.remove('moveLuckAnimation');
            firstElWrap.classList.remove('leaveLuckAnimation');
            firstElImg.classList.remove('leaveLuckAnimation');
            firstElImg.nextElementSibling.style.display = "block";
            _this.computeLuckAud();
          }
        }, false);


      },
      //注册入场人员动画完成事件
      renderEnter: function () {
        let listEl = this.$refs.headList;
        let firstEl = listEl.children[0];
        let lasttEl = listEl.children[listEl.children.length - 1];
        let _this = this;
        lasttEl.addEventListener("webkitAnimationEnd", function () { //动画结束时事件 
          console.log('excute webkitAnimationEnd');
          listEl.classList.remove('moveAnimation');
          firstEl.classList.remove('leaveAnimation');
          lasttEl.classList.remove('enterAnimation');
          firstEl.children[1] && (firstEl.children[1].style.display = "block");
          let pendingData = _this.pendingEnter.shift();
          _this.enterAudience.push(pendingData.number);
          _this.enterBase64.push(pendingData.img);
          if (_this.enterAudience.length > 13) {
            _this.enterAudience.shift();
            _this.enterBase64.shift();
          }
          if (_this.pendingEnter.length > 0) {
            //这用nexttick貌似不可以 待修正 先用settimeout 让任务排最后
            setTimeout(_this.addEnter, 0)
          } else {
            _this.excuteEnterFlag = false;
          }
          if (_this.enterAudience[_this.enterAudience.length - 1].toString().endsWith('88')) {
            _this.luckNum = _this.enterAudience[_this.enterAudience.length - 1];
            _this.luckNumberBase =  _this.enterBase64[_this.enterBase64.length - 1];
            _this.show88Luck();
          }
        }, false);
        _this.addEnter();
      },
      //最上列的入场人员动画展示
      addEnter: function () {
        console.log('excute Enter');
        if (this.pendingEnter.length === 0) {
          this.excuteEnterFlag = false;
        } else {
          this.excuteEnterFlag = true;
          let listEl = this.$refs.headList;
          let firstEl = listEl.children[0];
          let lasttEl = listEl.children[listEl.children.length - 1];
          if (this.enterAudience.length < 13) {
            if (this.enterAudience.length < 2) {
              let pendingData = this.pendingEnter.shift();
              this.enterAudience.push(pendingData.number);
              this.enterBase64.push(pendingData.img);
              if (this.enterAudience[this.enterAudience.length - 1].toString().endsWith('88')) {
                this.luckNum = this.enterAudience[this.enterAudience.length - 1];
                this.luckNumberBase =  this.enterBase64[this.enterBase64.length - 1];
                this.show88Luck();
              }
              if (this.pendingEnter.length > 0) {
                if (this.enterAudience.length !== 2) {
                  this.$nextTick(this.addEnter);
                }
              } else {
                this.excuteEnterFlag = false;
              }
            } else {
              this.enterLastBase64 = this.pendingEnter[0].img;
              lasttEl.classList.add('enterAnimation');
            }
          } else {
            this.enterLastBase64 = this.pendingEnter[0].img;
            firstEl.children[1].style.display = "none";
            listEl.classList.add('moveAnimation');
            firstEl.classList.add('leaveAnimation');
            lasttEl.classList.add('enterAnimation');
          }
        }
      },
      //中奖显示时长在此处调整
      show88Luck: function () {
        this.$refs.enterEl.style.display = 'none';
        this.$refs.selectEl.style.display = 'block';
        let listEl = this.$refs.headImg;
        let _this = this;
        setTimeout(function () {
          if (_this.totalLuckAudience.length > 8) {
            clearInterval(_this.luckIntervalInstance);
            _this.luckAudience = _this.totalLuckAudience.slice(_this.totalLuckAudience.length - 8);
            _this.luckBase64 = _this.totleBase64.slice(_this.totleBase64.length - 8);
          }
          listEl.classList.add('luckerDown' + (_this.totalLuckAudience.length < 8 ? _this.totalLuckAudience.length : ''));
        }, 15000)
      },
      /**
       * 注册中奖后的下滑动画完成事件监听 1、清除动画 2 将中奖号码保存
       */
      luckAmEnd: function () {
        let _this = this;
        let listEl = this.$refs.headImg;
        listEl.addEventListener("webkitAnimationEnd", function (e) { //动画结束时事件
          listEl.classList.remove('luckerDown' + (_this.totalLuckAudience.length < 8 ? _this.totalLuckAudience.length : ''));
          _this.$refs.selectEl.style.display = 'none';
          _this.$refs.enterEl.style.display = 'block';
          _this.totalLuckAudience.push(_this.luckNum);
          _this.totleBase64.push(_this.luckNumberBase);
          if (_this.totalLuckAudience.length < 10) {
            _this.addLuck();
          } else {
            _this.showIndex = _this.totalLuckAudience.length - 9;
            _this.computeLuckAud();
            _this.luckIntervalInstance = setInterval(_this.addLuck, 3000);
          }
          _this.addEnter();
        }, false);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .luckerDown {
    animation: luckerDown 2s;
    -webkit-animation: luckerDown 2s;
  }

  @keyframes luckerDown {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(816px, 780px);
    }
  }

  .luckerDown7 {
    animation: luckerDown7 2s;
    -webkit-animation: luckerDown7 2s;
  }

  @keyframes luckerDown7 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(629px, 780px);
    }
  }

  .luckerDown6 {
    animation: luckerDown6 2s;
    -webkit-animation: luckerDown6 2s;
  }

  @keyframes luckerDown6 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(442px, 780px);
    }
  }

  .luckerDown5 {
    animation: luckerDown5 2s;
    -webkit-animation: luckerDown5 2s;
  }

  @keyframes luckerDown5 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(255px, 780px);
    }
  }

  .luckerDown4 {
    animation: luckerDown4 2s;
    -webkit-animation: luckerDown4 2s;
  }

  @keyframes luckerDown4 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(68px, 780px);
    }
  }

  .luckerDown3 {
    animation: luckerDown3 2s;
    -webkit-animation: luckerDown3 2s;
  }

  @keyframes luckerDown3 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(-119px, 780px);
    }
  }

  .luckerDown2 {
    animation: luckerDown2 2s;
    -webkit-animation: luckerDown2 2s;
  }

  @keyframes luckerDown2 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(-306px, 780px);
    }
  }

  .luckerDown1 {
    animation: luckerDown1 2s;
    -webkit-animation: luckerDown1 2s;
  }

  @keyframes luckerDown1 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(-493px, 780px);
    }
  }

  .luckerDown0 {
    animation: luckerDown0 2s;
    -webkit-animation: luckerDown0 2s;
  }

  @keyframes luckerDown0 {
    0% {

    }
    100% {
      width: 147px;
      height: 147px;
      transform: translate(-680px, 780px);
    }
  }

  .leaveLuckAnimation {
    animation: leaveLuckAnimation 1s;
    -webkit-animation: leaveLuckAnimation 1s;
  }

  @keyframes leaveLuckAnimation {
    0% {
      opacity: 0.2;
    }
    25% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  .moveLuckAnimation {
    animation: moveLuckAnimation 1s;
    -webkit-animation: moveLuckAnimation 1s;
  }

  @keyframes moveLuckAnimation {
    0% {

    }
    100% {
      transform: translate(-185px, 0);
    }
  }

  .enterAnimation {
    animation: enterAnimation 0.5s;
    -webkit-animation: enterAnimation 0.5s;
  }

  @keyframes enterAnimation {
    0% {

    }
    100% {
      width: 72px;
      height: 72.5px;
    }
  }

  .moveAnimation {
    animation: moveAnimation 0.5s;
    -webkit-animation: moveAnimation 0.5s;
  }

  @keyframes moveAnimation {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(-55px, 0);
    }
  }

  .leaveAnimation {
    animation: leaveAnimation 0.5s;
    -webkit-animation: leaveAnimation 0.5s;
  }

  @keyframes leaveAnimation {
    0% {

    }
    100% {
      width: 0;
      height: 0;
    }
  }

  .container {
    height: 100%;
    background-image: url("../assets/img/awardbg.png");
    .selected {
      height: 793px;
      text-align: center;
      .sel-head {
        height: 430px;
        padding-top: 60px;
        .sel-head-img {
          width: 430px;
          height: 430px;
          margin: 0 auto;
          background-image: url("../assets/img/selectbg.png");
          background-size: 100% 100%;
          img {
            margin-top: 17%;
            width: 66%;
            height: 66%;
            border-radius: 50%;
          }
        }
      }
      .sel-font {
        font-family: PingFangSC-Regular;
        color: #FFFFFF;
        font-size: 34px;
        line-height: 48px;
        p:nth-child(2) {
          font-family: PingFangSC-Semibold;
          font-size: 54px;
          line-height: 75px;
          span {
            font-size: 130px;
            line-height: 182px;
          }
        }
      }
    }
    .luck-wrap {
      .luck-head {
        padding: 30px;
        .img-wrap {
          float: left;
          width: 130px;
          height: 147px;
          background-image: url("../assets/img/luckhead.png");
          position: relative;
          margin-left: 25px;
          margin-right: 32px;
          .po-wrap {
            position: absolute;
            bottom: -3px;
            right: 4px;
            img {
              width: 106px;
              height: 106px;
              border-radius: 50%;
            }
            p {
              position: absolute;
              bottom: -45px;
              right: -5px;
              font-family: PingFangSC-Regular;
              font-size: 24px;
              color: #FFFFFF;
              line-height: 33px;
              text-align: right;
              width: 200px;
            }
          }
        }
      }

      .logo-wrap {
        float: left;
        margin-left: 28px;
        img {
          width: 153px;
          height: 190px;
        }
      }
    }
    .exhibition {
      height: 405px;
      text-align: center;
      h1 {
        margin-top: 165.6px;
        font-family: PingFangSC-Semibold;
        font-size: 100px;
        color: #FFFFFF;
        letter-spacing: 25px;
        line-height: 140px;
      }
      h2 {
        margin-top: 35px;
        font-family: PingFangSC-Regular;
        font-size: 44px;
        color: #FFFFFF;
        font-weight: 300;
      }
    }
    .enter {
      .head-portrait-list {
        display: flex;
        justify-content: flex-start;
        width: 1680px;
        margin-left: 172px;
        padding-top: 150px;
        min-height: 50px;
        .head-warp {
          margin-right: 57px;
          width: 72px;
          height: 72.5px;
          text-align: center;
          &:last-child {
            margin-right: 0px;
          }
          img {
            border-radius: 50%;
            width: 100%;
            height: 100%;
          }
          p {
            font-family: PingFangSC-Regular;
            font-size: 17px;
            color: #FFFFFF;
            line-height: 24px;
            white-space: nowrap;
          }
        }
      }
    }
  }
</style>
