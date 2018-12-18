<template>
  <div class="container">
    <header>
      <h1>Field information feedback</h1>
    </header>
    <div style="height: 85%">
      <div class="enter-wrap">
        <div class="entering">
          <h4>Feedback information: </h4>
          <textarea rows="10" cols="80" style="resize:none" ref="textarea"></textarea>
          <h4>Feedback area: </h4>
          <select ref="selectarea">
            <option value="">please select</option>
            <option value="Workstation">Workstation</option>
            <option value="Mobile ThinkPad">Mobile ThinkPad</option>
            <option value="Smart office">Smart office</option>
            <option value="Smart PC">Smart PC</option>
            <option value="Commercial IOT">Commercial IOT</option>
            <option value="School">School</option>
            <option value="Smart Home">Smart Home</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Audio /Video">Audio /Video</option>
            <option value="Gaming">Gaming</option>
          </select>
          <div class="commit" @click="commitMes">
            commit
          </div>
        </div>

        <div class="mes-list">
          <h3>Message Lists</h3>
          <div class="mes" v-for="(item,index) in message" :key="index">
            <p>{{ index+1+'、'+item.message }}</p>
            <a href="#" @click="deleteList(item.id)">delete</a>
            <span>{{ item.date }}</span>
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
        message: []
      }
    },
    mounted(){
      this.$nextTick( this.initSocket());
      let _this = this;
      window.addEventListener('unload', function () {
        _this.destory();
      });
      window.addEventListener('beforeunload', function () {
        _this.destory();
      });
    },
    methods: {
      deleteList: function(id){
        this.socket.send("delete:"+id);
      },
      commitMes: function () {
        // if(this.socket.readyState !== 1){
        //   alert('与服务器建立连接失败，请检查您的网络连接状态，如仍连接有误请联系管理员(张兆勇：18514591362,王丹枫：17733810416)');
        // }
        let msg = this.$refs.textarea.value;
        if(msg.replace(/\s*/g,"") !== ""){
          let area = this.$refs.selectarea.value || 'unknown';
          this.socket.send("【"+area+"】"+msg);
          this.$refs.textarea.value = '';
        }
      },
      /**
       * 初始化 websocket连接
       */
      initSocket() {
        this.socket = new WebSocket('ws://10.110.131.249:9006/'); //History_booth_heat
        this.socket.onmessage = this.onMessage;
        this.socket.onclose = this.onClose;
        this.socket.onopen = this.onOpen;
      },
      destory() {
        this.socket.send('disconnect');
      },
      onMessage(ev) {
        this.message = eval('(' + ev.data + ')');

      },
      onOpen() {

      },
      onClose() {
        alert('与服务器建立连接失败，请检查您的网络连接状态，如仍连接有误请联系管理员(张兆勇：18514591362,王丹枫：17733810416)');
        console.log('socket is closed');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    height: 100%;
    header{
      height: 100px;
      background-color: rgba(50,60,96,1);
      color: #eeeeee;
      h1{
        text-align: center;
        line-height: 100px;
      }
    }

    .enter-wrap{
      display: flex;
      justify-content: space-between;
      height: 100%;
      .mes-list{
        height: 100%;
        flex: 0 1 35%;
        background-color: #eeeeee;
        padding: 10px 30px;
        overflow: scroll;
        h3{
          display: inline-block;
          border-top: #797979 dotted 2px;
          border-bottom: #797979 dotted 2px;
          padding: 5px;
        }
        .mes{
          padding: 10px 0;
          border-bottom: #797979 solid 1px;
          a{
            text-decoration: none;
          }
          p{
            font-size: 16px;
            line-height: 30px;
            word-break: break-word;
          }
          span{
            float: right;
          }
        }
      }
      .entering{
        padding: 30px;
        h4{
          margin: 20px 0;
        }
        select{
          height: 30px;
        }
        .commit{
          margin: 20px 0;
          background-color: cornflowerblue;
          color: #fff;
          text-align: center;
          font-size: 20px;
          font-weight: 500;
          padding: 5px;
          border-radius: 4px;
          &:hover{
            background-color: dodgerblue;
          }
        }
      }
    }
  }
</style>
