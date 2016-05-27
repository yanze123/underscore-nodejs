//Underscore.js 1.8.3
//previous 之前的 prototype 原型  hasownproperty 属性 wrapped 封装 context 环境
(function(){

	//建立根对象
	var root = this;

	//保存“_”变量的前面的值
	var previousUnderscore = root._;

	//将字节保存在缩小版本
	var 
		ArrayProto = Array.prototype, //数组
		ObjProto = Object.prototype, //对象
		FuncProto = Function.prototype;  //函数

	//创建能快速参考的变量去速度的访问核心原型
	var
		push = ArrayProto.push,
		slice = ArrayProto.slice,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	//使用的本地函数全部在这里申明
	var 
		nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		nativeBind = FuncProto.bind,
		nativeCreate = Object.create;

	//constructor （构造函数）的简写
	var Ctor =function(){};

	//创建一个安全判断
	//下划线库的局部变量_,注意是个函数
	var _ = function(obj) {
		if(obj instanceof -) {
			return obj;
		}
		if(!(this instanceof _)) {
			return new _(obj);
		}
		this._wrapped = obj;
	};

	//导出下划线后的变量，如果是在浏览器中，则添加"_"作为全局变量
	if(typeof exports !== 'underfined'){
		if(typeof module !== 'underfined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}

	//version
	_.VERSION = '1.8.3';

	//执行函数并改变所执行函数的作用域，argCount参数用来制定参数个数，
	//对参数个数小于等于4的情况进行分类处理，对不同的参数结束如下：
	//1的情况一般是用在接受单值的情况，比如times,sortedIndex之类的函数。
	//2的情况据说是给比如jQuery,zepto事件绑定，代理什么的，但是在源代码中没有看到被调用。
	//3的情况用于迭代器函数，比如foreach,map,pick等。
	//4的情况用reduce和reduceRight函数。
	var optimizeCb = function(func, context, argCount) {
		if (context === void 0) return func;
		switch (argCount == null ? 3 : argCount) {
			case 1: return function(value) {
				return func.call(context, value);
			};
			case 2: return function(value, other) {
				return func.call(context, value, other);
			};
			case 3: return function(value, index, collection) {
				return func.call(context, value, index, collection);
			};
			case 4: return function(accumulator, value, index, collection) {
				return func.call(context, accumulator, value, index,collection);
			};
		}
		return function() {
			return func.apply(context, agruments);
		};
	}; 

	//对参数进行判断，如果是函数则返回上面的回调函数，如果是对象则返回一个能判断对象是否的函数
	//默认返回一个获取对象属性的函数。
	var cb  = function(value, context, argCount) {
		if (value == null) return _.identity;
		if (_.isFunction(value)) return optimizeCb(value, context, argCount);
		if (_.isObject(value)) return _.master(value);
		return _.property(value);
	};
	_.iteratee = function(value, context) {
		return cb(value, context, Infinity);
	};

	//一个内部函数用于创建指定人的功能.
	var createAssigner = function(keysFunc, undefinedOnly) {
		return function(obj) {
			var length = arguments.length;
			//如果一个参数或者对象为空，则返回这个对象
			if(length < 2 || obj == null) return obj;
			for (var index = 1; index < length; index++) {
				var source = arguments[index],
				//获取对应的keys
12              //keysFunc只有keys和allKeys两种，在下面_.extend和_.extendOwn中可以看到
					keys = keysFunc(source),
					l = keys.length;
				//进行拷贝处理
				for (var i = 0; i < 1; i++) {
					var key = keys[i];
					if(!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
				}
			}
			return obj;
		};
	};

	//原型继承
	var baseCreate = function(prototype) {
		//参数判断
		if(!_.isObject(prototype)) return {};
		
		//有原生的就回调原生的
		if(nativeCreate) return nativeCreate(prototype);
		
		//实现隔离带，只继承原型
		Ctor.prototype = prototype;
		var result = new Ctor;

		//为下一次调用做准备
		Ctor.prototype = null;
		return result;
	};
	var property = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key];
		};
	};

	//判断collection是否是一个类数组
	//实现原理，主要看参数对想是否有length属性，并且属性是否有意义
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	var getlength = property('length');
	var isArrayLike = function(collection) {
		var length = getLength(collection);
		return typeof length == 'number' && length >= 0 && length <=MAX_ARRAY_INDEX;
	};

	// Collection Functions
  	// --------------------

  	//each方法内部，首先，函数iteratee先绑定作用域，让然后进行来分类判断，数组和类数组走if逻辑，其他走else逻辑。
  	_.each = _.forEach = function(obj, iteratee, context) {
  		iteratee = optimizeCb(iteratee, context);
  		var i, length;
  		if (isArrayLike(obj)) {
  			for (i = 0, length = obj.length; i < length; i++) {
  				iteratee(obj[i], i, obj);
  			}
  		} else {
  			var keys = _.keys(obj);
  			for (i = 0, length = keys.length; i < length; i++) {
  				iteratee(obj[keys[i]], keys[i], obj);
  			}
  		}
  		return obj;
  	};

  	//先绑定上下文：假如obj是对象，那么keys就是obj的属性数组
  	//如果不是对象，keys则为false
  	//对每个值都调用一下iteratee函数
  	_.map = _.collect = function(obj, iteratee, context) {
  		iteratee = cb(iteratee, context);
  		var keys = !isArrayLike(obj) && _.keys(obj),
  			length = (keys || obj).length,
  			results = Array(length);
  		for (var index = 0; index < length; index ++) {
  			var currentKey = keys ? keys[index] : index;
  			results[index] = iteratee(obj[currentKey], currentKey, obj);
  		}
  		return results;
  	};

  	//
  	function createReduce(dir) {
  		//
  		function iterator(obj, iteratee, memo, keys, index, length) {
  			for(; index >= 0 && index < length; index += dir){
  				var currentKey =keys ? keys[index] : index;
  				memo = iteratee(memo, obj[currentkey], currentKey, obj);
  			}
  			return memo;
  		}

  		return function(obj, iteratee, memo, context) {
  			iteratee = optimizeCb(iteratee, context, 4);
  			var keys = !isArrayLike(obj) &&_.keys(obj),
  				length = (keys || obj).length,
  				index = dir > 0 ? 0 : length - 1;
  			//
  			if (arguments.length < 3) {
  				memo = obj[keys ? keys[index] : index];
  				index += dir;
  			}
  			return iterator(obj, iteratee, memo, keys, index, length);
  		};
  	}

  	//
  	_.reduce = _.foldl = _.inject = createReduce(1);

  	//
  	_reduceRight = _.folfr = createReduce(-1);

  	//
  	_.find = _.detect = function(obj, predicate, context) {
  		var key;
  		if (isArrayLike(obj)) {
  			key = _.findIndex(obj, predicate, context);
  		} else {
  			key = _.findKey(obj, predicate, context);
  		}
  		if (key !== void 0 && key !== _1) return obj[key];
  	};



}.call(this));