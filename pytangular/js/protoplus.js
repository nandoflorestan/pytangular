'use strict';

/* protoplus.js adds methods to Array so it becomes a more competent collection
	for model manipulation. Requires ECMAScript 5.
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

	.filter(predicate) returns a new array with the elements that pass *predicate*. (This is part of ECMAScript 5.)
	The *predicate* fn signature is: (element, index, array): boolean
*/

// .find(predicate) returns a single element, or undefined.
// Polyfill from ECMAScript 6 (Harmony):
if (!Array.prototype.find) {
	Object.defineProperty(Array.prototype, 'find', {value: function (predicate) {
		if (this == null) {
			throw new TypeError('Array.prototype.find called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return value;
			}
		}
		return undefined;
	}});
}
// Polyfill from ECMAScript 6 (Harmony):
if (!Array.prototype.findIndex) {
	Object.defineProperty(Array.prototype, 'findIndex', {value: function (predicate) {
		if (this == null) {
			throw new TypeError('Array.prototype.findIndex called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return i;
			}
		}
		return -1;
	}});
}


// Assuming the array items are objects, filter them according to the *conditions* and return a new array.
// conditions are strings or 2-tuples. Example:
// arr.query("age >= 7", "city.state != 'CA'", ['name ==', givenName])
Object.defineProperty(Array.prototype, 'query', {value: function () {
	return this.filter(this._mkPredicate(arguments));
}});
Object.defineProperty(Array.prototype, '_mkPredicate', {value: function (conditions) {
	return function (elem, i, array) {
		for (var i = 0; i < conditions.length; i++) {
			var cond = conditions[i];
			if (typeof cond == 'string')  var c = 'elem.' + cond;
			else {
				if (cond.length != 2)
					throw 'Non-string condition must have 2 parts: ' + cond;
				var c = 'elem.' + cond[0] + ' ';
				if (typeof cond[1] == 'string')
					c += '"' + cond[1].replace('"', '\\"') + '"';
				else  c += cond[1];
			}
			if (!eval(c)) return false;
		};
		return true;
	};
}});
// Faster: Similar to query(), but stops searching and returns the first found:
Object.defineProperty(Array.prototype, 'query1', {value: function () {
	return this.find(this._mkPredicate(arguments));
}});
Object.defineProperty(Array.prototype, 'queryIndex', {value: function () {
	return this.findIndex(this._mkPredicate(arguments));
}});

// [{a: 1}, {a: 2}].listOf('a') returns [1, 2]
Object.defineProperty(Array.prototype, 'listOf', {value: function (fieldName) {
	var result = [];
	for (var i = 0; i < this.length; i++) {
		result.push(this[i][fieldName]);
	};
	return result;
}});

// Replaces or appends a *newObj*
Object.defineProperty(Array.prototype, 'put', {value: function (newObj, fieldName) {
	fieldName = fieldName || 'id';
	var index = this.findIndex(function (elem) {
		if (elem[fieldName] == newObj[fieldName])  return true;
	});
	if (index == -1)  this.push(newObj);
	else  this.splice(index, 1, newObj);
}});

Object.defineProperty(Array.prototype, 'remove', {value: function (value, fieldName) {
	fieldName = fieldName || 'id';
	var index = this.findIndex(function (elem) {
		if (elem[fieldName] == value)  return true;
	});
	this.splice(index, 1);
}});

Object.defineProperty(Array.prototype, 'contains', {value: function (o) {
	return this.indexOf(o) != -1;
}});

// Example of using move: array = [1,2,3,4,5,6,7,8];
// Move 3 up to create array = [1,2,4,3,5,6,7,8]
// array.move(2, 3);
// (move the item with index 2 to position 3)
Object.defineProperty(Array.prototype, 'move', {value: function (old_index, new_index) {
	if (new_index >= this.length) {
		var i = new_index - this.length;
		while ((i--) + 1) {
			this.push(undefined);
		}
	}
	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	return this;
}});

/* TESTS
require('./protoplus.js')
var a = [{id: 1, cor: 'verde'}, {id: 2, cor: 'vermelho'}, {id: 3, cor: 'amarelo'}, {id: 4, cor: 'azul'}];
for (var o in a) {console.log(o)};
a.queryIndex('cor == "verde"')  // 0
a.queryIndex('cor == "azul"')  // 3
var azul = 'azul';
a.queryIndex(['cor == ', azul])  // 3
a.listOf('cor')
a.put({id: 2, cor: 'rosa'});
a.remove(3);
*/

// Generate UUID
function generateUUID () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

// Get the time to display a message
function getReadingTime(obj, min, speed) {
	speed = speed || 90;  // Takes one second to read 11 chars
	min = min || 3000;  // but the min is 3 seconds
	var len = 0;
	if (obj.title) len += obj.title.length;
	if (obj.msg)   len += obj.msg.length;

	var duration = len * speed;
	if (duration < min)  duration = min;
	return duration;
}
