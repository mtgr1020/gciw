<template>
  <div class="num-wrap">
    <div class="slide" v-for="(item,index) in numList" :key="index" :style="{left: index*55 + 'px'}"
         :ref="'slide'+index">
      <div>
        <h4>{{ item }}</h4>
      </div>
      <div>
        <h4>{{ newNumList[index] }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        numList: ['0'],
        newNumList: ['0'],
      }
    },
    props: {
      time: {
        type: Number,
        default: 2
      },
      value: {
        type: Number,
        default: '0'
      }
    },
    computed: {
      spliteVal: function () {
        return this.value.toString().split('');
      }
    },
    watch: {
      spliteVal: function (newV, oldV) {
        this.newNumList = newV;
        if(newV.length>oldV.length){
          let len = newV.length - oldV.length;
          for(let i=0;i<len;i++){
            this.numList.unshift('0');
          }
        }
        let cindex = [];
        for (let i = 0; i < newV.length; i++) {
          if (newV[i] !== oldV[i]) {
            cindex.push(i);
          }
        }

        if (cindex.length > 0) {
          let _this = this;
          if(this.numList[0] === '0'){
            setTimeout(_this.scollNumber,0,cindex);
          }else{
            this.$nextTick(this.scollNumber(cindex));
          }
        }

      },
    },
    methods: {
      scollNumber: function (cindex, i = 0) {
        if (cindex[i] === undefined) {
          return false;
        }
        const speed = 5;
        let _this = this;
        let slide = _this.$refs['slide' + (cindex[i])][0];
        let slide2 = slide.children[1];
        let slide1 = slide.children[0];
        let MyMar = setInterval(Marquee, speed);

        function Marquee() {
          if (slide2.offsetTop - slide.scrollTop <= 0) {
            _this.numList = _this.newNumList;
            slide.scrollTop -= slide1.offsetHeight;
            clearInterval(MyMar);
          } else {
            slide.scrollTop++
          }
        }

        this.scollNumber(cindex, ++i);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .num-wrap {
    position: relative;
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
</style>
