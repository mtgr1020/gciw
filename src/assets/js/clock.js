;(function(name, context, factory) {
	if(typeof module !== "undefined" && module.exports) {
		module.exports = factory();
	} else if(typeof define === "function" && define.amd) {
		define(factory)
	} else {
		context[name] = factory();
	}
})('clock', this, function() {

  const clockConfig = {
    chinese : ['日','一','二','三','四','五','六','日',]
	};

  const Util = {
		merge: function() {
			var merged = {};
			var argsLen = arguments.length;
			for(let i = 0; i < argsLen; i++) {
				const obj = arguments[i]
				for(let key in obj) {
					merged[key] = obj[key];
				}
			}
			return merged;
		}
	};

  const clock = (function clockClosure() {
		function clock() {
			this._config = Util.merge(clockConfig, arguments[0] || {});
			this.start();
			//TODO  由于不需要停 所以没写 clearRequestAnimationFrame
		}

    clock.prototype = {
			start: function() {
			  this.computed.call(this);
			},
			computed: function(){
				let nowDate = new Date();

				this._config.year = nowDate.getFullYear();
				this._config.month = nowDate.getMonth()+1;
				this._config.day = nowDate.getDate()<10?'0'+nowDate.getDate():nowDate.getDate();
				this._config.hour = nowDate.getHours()<10?'0'+nowDate.getHours():nowDate.getHours();
        this._config.minute = nowDate.getMinutes()<10?'0'+nowDate.getMinutes():nowDate.getMinutes();
        this._config.second = nowDate.getSeconds()<10?'0'+nowDate.getSeconds():nowDate.getSeconds();
        this._config.week = nowDate.getDay();
				this.render();
			},
			render: function(){
				this._config.container.innerText = `${this._config.month}.${this._config.day}.${this._config.year}  ${this._config.hour}:${this._config.minute}:${this._config.second}`;
				
				requestAnimationFrame(this.computed.bind(this));
			}
		};
		return clock;
	})();

	const clockFactory = {
		create: function(config) {
			return new clock(config);
		}
	};

	return clockFactory;
});
