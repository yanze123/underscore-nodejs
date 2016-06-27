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

	//导出下划线后的变量，如果是在浏览器中，则添加"_"作为全局变量.
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

  	//遍历数组，返回第一个回调检测为真的值
  	_.find = _.detect = function(obj, predicate, context) {
  		var key;
  		if (isArrayLike(obj)) {
  			key = _.findIndex(obj, predicate, context);
  		} else {
  			key = _.findKey(obj, predicate, context);
  		}
  		if (key !== void 0 && key !== _1) return obj[key];
  	};

  	//遍历list，返回回调函数为真的值
  	_.filter = _.select = function(obj , predicate, context) {
  		var results = [];
  		predicate = cb(predicate, context);
  		_.each(obj, function(value, index, list) {
  			if(predicate(value, index, list)) results.push(value);
  		});
  		return results;
  	};

  	//与filter相反
  	_.reject = function(obj, predicate, context) {
  		return _.filter(obj, _negate(cb(predicate)), context);
  	};

  	//确定所有元素都匹配
  	_.every = _.all = function(obj, predicate, context) {
  		predicate = cb(predicate, context);
  		var 
  			keys = !isArrayLike(obj) && _.keys(obj),
  			length = (keys || obj).length;
  		for (var index = 0; index < length; index++) {
  			var currentkey = keys ? keys[index] : index;
  			if(!predicate(obj[currentKey], currentkey, obj)) return false;
  		}
  		return true;
  	}

  	//如果list中有任何一个元素通过predicate的真值检测就返回true,一旦找到了
  	//符合条件的元素，就中断对数组的遍历
  	_.some = _.any = function(obj, predicate, context) {
  		predicate = cb(predicate, context);
  		var 
  			keys = !isArrayLike(obj) && _.keys(obj),
  			length = (keys || obj).length;
  		for (var index = 0; index < length ; index++) {
  			var currentKey = keys ? keys[index] : index;
  			if (predicate(obj[currentKey], currentKey, obj)) return true;
  		}
  		return false;
  	};

  	//如果list包括指定的value则返回true，如果list是数组，内部使用indexof判断
  	_.contain = _.includes = _,include = function(obj, item, fromIndex, guard) {
  		if(!isArrayLike(obj)) obj = _.value(obj);
  		if(typeof fromIndex != 'number' || gurad) fromIndex = 0;
  		return _.indexOf(obj, item, fromIndex) >= 0;  	
  	};

  	//在list的每个元素上执行methodName方法，任何传递给invoke的额外参数，
  	//invoke都会在调用methodName方法的时候传递信息;
  	_.invoke = function(obj, method) {
  		var args = slice.call(arguments, 2);
  		var inFunc = _.isFunction(method);
  		return _.map(obj, function(value) {
  			var func = isFunc ? method : value[method];
  			return func == null ? func : func.apply(value, ages); 
  		});
  	};

  	//pluck是map经常使用的用例模型的版本，即萃取对象数组中的某个属性值，返回一个数组
  	_.pluck = function(obj, key) {
  		return _.map(obj, _.property(key));
  	};

  	//
  	_.where = function(obj, attrs) {
  		return _.filter(obj, _.matcher(attrs));
  	};

  	//
  	_.findWhere = function(obj, attrs) {
  		return _.find(obj, _.matcher(attrs));
  	};

  	//
  	_.max = function(obj, iteratee, context) {
  		var result = -Infinity, lastComputed = -Infinity,
  			value, computed;
  		if(iteratee == null && obj != null) {
  			obj = isArrayLike(obj) ? obj : _.values(obj);
  			for(var i = 0, length = obj.length; i < length; i++) {
  				value = obj[i];
  				if(value > result) {
  					result = value;
  				}
  			}
  		} else {
  			iteratee = cb(iteratee, context);
  			_.each(obj, function(value, index, list) {
  				computed = iteratee(value, index, list);
  				if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
  					result = value;
  					lastComputed = -computed;
  				}
  			};
  		}
  		return result;
  	};

  	//
  	_min = function(obj, iteratee, context) {
  		var result = Infinity, lastComputed = Infinity,
  			value, computed;
  		if(iteratee == null && obj != null) {
  			obj = isArrayLike(obj) ? obj : _.values(obj);
  			for (var i = 0, length = obj.length; i < length; i++) {
  				value = obj[i];
  				if (value < result) {
  					result = value;
  				}
  			}
  		} else {
  			iteratee = cb(iteratee, context);
  			_.each(obj, function(value, index, list){
  				computed = iteratee(value, index, list);
  				if(computed < lastComputed || computed === Infinity && result === Infinity){
  					result = value;
  					lastComputed = computed;
  				}
  			});
  		}
  		return result;
  	}

  	//
  	_.Shuffle = function(obj) {
  		var set = isArrayLike(obj) ? obj : _.values(obj);
  		var length = set.length;
  		var shuffled = Array(length);
  		for (var index = 0 , rand; index < length; index ++) {
  			rand = _.random(0. index);
  			if (rand !== index) shuffled[index] = shuffled[rand];
  			shuffled[rand] = set[index];
  		}
  		return shuffled;
  	};

  	//
  	_.sample = function(obj, n, guard) {
  		if(n == null || guard) {
  			if(!isArrayLike(obj)) obj = _.values(obj);
  			return obj[_.random(obj.length - 1)];
  		}
  		return _.Shuffle(obj).slice(0, Math.max(0, n));
  	};

  	//
  	_.sortBy = function(obj, iteratee, context) {
  		iteratee = cb(iteratee, context);
  		return _.pluck(_.map(obj, function(value, index, list) {
  			return {
  				value: value,
  				index: index,
  				criteria: iteratee(value, index, list)
  			};
  		}).sort(function(left, right){
  			var a = left.criteria;
  			var b = right.criteria;
  			if(a !== b) {
  				if (a > b || a === void 0 ) return 1;
  				if (a < b || b === void o ) return _1; 
  			}
  			return left.index - right.index;
  		}). 'value');
  	};

  	//
  	var group = function(behavior) {
  		return function(obj, iteratee, context) {
  			var result = {};
  			iteratee = cb(iteratee, context);
  			_.each(obj, function(value, index) {
  				var key = iteratee(value, index, obj);
  				behavior(result, value, key);
  			});
  			return result;
    	};
  	};

  	//
  	_.groupBy = group(function(result, value, key) {
  		if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  	});

  	//
  	_.indexBy = group(function(result, value, key) {
  		result[key] = value;
  	});

  	//
  	_.countBy = group(function(result, value, key) {
  		if(_.has(result, key)) result[key]++; else result[key] = 1;
  	});

  	//
  	_.toArray = function(obj) {
  		if(!obj) return [];
  		if(_.isArray(obj)) return slice.call(obj);
  		if(isArrayLike(obj)) return _.map(obj, _.identity);
  		return _.values(obj);
  	};

  	//
  	_.size = functon(obj) {
  		if (obj == null) return 0;
  		return isArrayLike(obj) ? obj.length : _.keys(obj).length; 
  	};

  	//
  	_.partition = function(obj, predicate, context) {
  		predicate = cb(predicate, context);
  		var pass = [], fail = [];
  		_.each(obj, function(value, key, obj) {
  			(predicate(value, key, obj) ? pass : fail).push(value);
  		});
  		return [pass, fail];
  	};

  	//Array Functions

  	//
  	_.first = _.head = _.take = function(array, n, guard) {
  		if (array == null) return void 0;
  		if (n ==null || guard) return array[0];
  		return _.initial(array, array.length -n);
  	};

  	//
  	_.initial = function(array, n, guard) {
  		return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 :n)));
  	};

  	//
  	_.last = function(array, n, guard) {
  		if (array ==null) return void 0;
  		if (n == null || guard) return array[array.length - 1];
  		return _.rest(array, Math.max(0, array.length - n));
  	};

  	//
  	_.rest = _.tail = _.drop = function(array, n, guard) {
  		return slice.call(array, n == null || guard ? 1 : n);
  	};

  	//
  	_.compact = function(array) {
  		return _.filter(array, _.identity);
  	};

  	//
  	var flatten = function(input, shallow, strict, startIndex) {
  		var output = [], idx = 0;
  		for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
  			var value = input[i];
  			if(isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
  				//
  				if(!shallow) value = flatten(value, shallow, strict);
  				var j = 0, len = value.length;
  				output.length += len;
  				while (j < len) {
  					output[idx++] = value[j++];
  				}
   			} else if (!strict) {
   				output[idx++] = value;
   			}
  		}
  		return output;
  	};

  	//
  	_.flatten = function(array, shallow) {
  		return flatten(array, shallow, false);
  	};
  	
  	//
  	_.without = function(array) {
  		return _.difference(array, slice.call(arguments, 1));
  	};
	   
    //

    
    
	
  	








}.call(this));
