<template>
  <div ref="main" style="overflow: hidden">
    <p v-for="items in rec" style="border-bottom: #eeeeee solid 1px;text-indent: 10px">
     <span v-for="item in items" style="margin-right: 10px">
       <span>{{ item.date }} -| </span>
       <span><i style="color: darkseagreen;">Exa_name: </i>{{ item.Exa_name }}</span>
       <span><i style="color: darkseagreen;">,coordinates: </i>{{ item.coordinates }}</span>
       <span><i style="color: darkseagreen;">,number: </i>{{ item.number }}</span>
     </span>
    </p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        socket: undefined,
        rec: [],
      }
    },
    mounted() {
      this.initSocket();
      let _this = this;
      window.addEventListener('unload', function () {
        _this.destory();
      });
      window.addEventListener('beforeunload', function () {
        _this.destory();
      });
    },
    methods: {
      scrollMain: function(){

      },
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
        let response = eval('(' + ev.data + ')');
        let key = Object.keys(response)[0];
        switch (key) {
          case 'Daily_heat_map':
            let resData = response['Daily_heat_map'];
            let _date = new Date();
            let datestr = '2018-12-0'+ _date.getDate()+ '  ' + _date.getHours() + ':' + _date.getMinutes() + ":" + _date.getSeconds();

            resData[0]['date'] = datestr;
            this.rec.push(resData);
            this.$nextTick(this.scrollMain);
            break;
          default:
        }
      },
      onOpen() {
        this.socket.send('Daily_heat_map');//热力图

      },
      onClose() {
        console.log('socket is closed');
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
