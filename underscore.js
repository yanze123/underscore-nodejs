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

})