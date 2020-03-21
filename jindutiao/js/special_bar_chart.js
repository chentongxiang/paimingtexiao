;(function($){

	function getId(length) {
	       return Number(Math.random().toString().substr(3,length) + Date.now()).toString(36);
	}
	function compare(property){
	    return function(a,b){
	        var value1 = a[property];
	        var value2 = b[property];
	        return  value2 - value1;
	    }
	}	
	function EchartObj(element,option){
		this.element = element;
		this.$element = $(element)
		this.domWidth = this.$element.width();
		this.domHeight = this.$element.height();
		this.option = option;
		this.data = option.data?option.data:[]; //传进来的数据
		this.dealData = this.data?this.data.sort(compare(1)):[]; //将传进来的数据排列好
		this.color = option.color?option.color:["#8600FF","#FF00FF","#0000E3","#F9F900","#FF5809","#00FFFF","#B87070","#A5A552","#73BF00","#00DB00"];
		this.time = option.time?option.time:30; //设置时间
		this.arrObj = [];
		this.childrenHeight = this.domHeight/this.data.length; 
		this.positionHeight = this.domHeight/(this.data.length+1); //每一个柱状条的高度
		this.maxdata = ""; //所有数据的最大值
		this.createBarobj(); 
		this.monitorChange();
	}

	EchartObj.prototype ={
		constructor:EchartObj,
		createBarobj:function(){
			this.$element.css({
				"position": "relative"
			})
			if(this.data){
				//找到最大值
				$.each(this.dealData,(i,v)=>{
					this.maxdata = this.maxdata>v[1] ? this.maxdata:v[1];
				})
				//将数据处理成百分比的形式
				$.each(this.dealData,(i,v)=>{
					this.dealData[i] = [(v[0]/this.maxdata).toFixed(5)*80,(v[1]/this.maxdata).toFixed(5)*80];
				})
				//
				$.each(this.data,(i,v)=>{
					var barDomId = getId(8);
					this.$element.append("<div id="+barDomId+" class="+barDomId+">" +
	        			"<div class=''></div>" +
	        			"<span class=''></span>" +
	        			" </div>"
	    			);
	    			$("#"+barDomId).css({
	    				"width":"100%",
						"height": this.positionHeight+"px",
						"display": "flex",
						"justify-content": "left",
						// "margin":"20px",
						"position":"absolute",
						"top": this.childrenHeight*i+"px"
	    			})
	    			$("#"+barDomId+" div:eq(0)").css({
	    				"width":"0px",
	    				"height":this.positionHeight+"px",
	    				"text-align":"center",
						"font-family":"Tahoma",
						"font-size":"18px",
						"line-height":this.childrenHeight+"px",
						"background-color": this.color[i],
						"opacity":"0.8"
	    			})
	    			var barObj = new BarObj(barDomId,v,this.childrenHeight,this.time,this.maxdata);
					barObj.setSpeed();
					this.arrObj.push(barObj);
				})
				
			}
		},
		//监控柱状图增量变化，然后把大的数切换到小数上面
		monitorChange:function(){
			var arrObj = this.arrObj;
			for (let i in arrObj) {
		    	if(typeof arrObj[i].num === 'number'){
					Object.defineProperty(arrObj[i], "num",{
					    set: function (value) {
					       if(arrObj[i]._num != value){
					        	arrObj[i]._num= value;
					        	if(arrObj[i].rank>=1){
					        		$.each(arrObj,function(j,v){

					        			if(arrObj[i].rank-arrObj[j].rank==1){
					        				if(arrObj[i]._num > arrObj[j]._num){
					        					var temp = arrObj[i].rank;
					        					arrObj[i].rank = arrObj[j].rank;
					        					arrObj[j].rank = temp;
					        					arrObj[i].top = arrObj[i].top-arrObj[i].height;
					        					arrObj[i].setTop(arrObj[i].top)
					        					arrObj[j].top = arrObj[j].top+arrObj[j].height
					        					arrObj[j].setTop(arrObj[j].top)
					        				}
					        			}else if(arrObj[i].rank-arrObj[j].rank==-1){
												if(arrObj[i]._num < arrObj[j]._num){
					        					var temp = arrObj[i].rank;
					        					arrObj[i].rank = arrObj[j].rank;
					        					arrObj[j].rank = temp;
					        					arrObj[i].top = arrObj[i].top+arrObj[j].height;
					        					arrObj[i].setTop(arrObj[i].top)
					        					arrObj[j].top = arrObj[j].top-arrObj[i].height
					        					arrObj[j].setTop(arrObj[j].top)
					        				}
					        			}	
					        		})
					        	}
					    	}
					    },
					    get:function(){
					    	return arrObj[i]._num;
					    }

					});

		    	}
	    	}
		}
	}
		
	function BarObj(barDomId,data,height,time,maxdata) {
	    this.barDomId = barDomId;
	    this.num = parseInt(data[0]); 
	    this._num = parseInt(data[0]);
	    this.endData = parseInt(data[1]);
	    this.height = height ;
	    this.top = $("#"+this.barDomId).position().top;
	    this.rank = Math.round(this.top/this.height);
	    this.interval = time/(parseInt(data[1]) - parseInt(data[0]));
	    this.timmer=null;
	    this.maxdata =maxdata;
	}
	BarObj.prototype={
	    constructor:BarObj,
	    setTop :function (topNum) {
	        $('#'+this.barDomId).animate({
	              top: topNum+'px'
	            },1000
	        );
	    },
	    add:function(i){
	        var $aa =$("#"+this.barDomId).find("div:eq(0)");
			$aa.css("width",i+"%");
			$("#"+this.barDomId).find("span:eq(0)").html((i/80*this.maxdata).toFixed(1))
		},
		setSpeed:function(){
			if(this.num>=this.endData){
				clearInterval(this.timmer)
				
			}else{
			  this.timmer =setInterval(()=>{
			  		this.add(this.num);
			    	this.num++;
			    	if(this.num>this.endData){
			    		clearInterval(this.timmer)
			    	}
			  },parseInt(this.interval*1000))

			}
		}
	}
	$.fn.specialBarChart=function (options) {        
		//默认的设置
        var defaults={
				data:[[10,50],[20,30],[20,40],[5,20]],
				color:["#8600FF","#FF00FF","#0000E3","#F9F900","#FF5809","#00FFFF","#B87070","#A5A552","#73BF00","#00DB00"]
		};   
		
        var endOptions=$.extend(defaults,options); 
       
        return this.each(function () {            
            if (!$.data(this, 'echartObj')) {
            	$.data(this, 'echartObj', new EchartObj(this, endOptions));
        	}    
        });
	};
})(jQuery);