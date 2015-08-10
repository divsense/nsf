var assert = require("assert");
var nsf = require("../index.js");
var data = require("./data1.json");

describe("childNodes", function(){

	it("should return array of child nodes", function(){

		var nodes = nsf.childNodes( data[0], data );

		assert.equal( nodes[0]._id, "d2" );
		assert.equal( nodes[1]._id, "d3" );
		assert.equal( nodes[2]._id, "d4" );

	});


});

describe("traverse, no order", function(){

	it("should return data in right order", function(){

		var acc = [];

		nsf.traverse( data, {}, function(err, node){
			acc.push(node._id);
		});

		assert.deepEqual( acc, ["f1","f2","d1","d4","d3","d2","d5","c11","c12"], "Not equal");
			

	});


});

describe("traverse, level order", function(){

	it("should return data in right order", function(){

		var acc = [];

		nsf.traverse( data, {order:nsf.LEVEL_ORDER}, function(err, node, level){
			acc.push(node._id);
		});

		assert.deepEqual( acc, ["f1","f2","d1","d2","d3","d4","d5","c11","c12"], "Not equal");

	});


});

describe("traverse, depth first", function(){

	it("should return data in right order", function(){

		var acc = [];

		nsf.traverse( data, {order:nsf.DEPTH_FIRST}, function(err, node, level){
			acc.push(node._id);
		});

		assert.deepEqual( acc, ["f1","d2","d3","d4","f2","d5","d1","c11","c12"], "Not equal");

	});


});

describe("find, by ID", function(){

	it("should return node index", function(){

		var index = nsf.findIndex( data, {byId: "f2"} );

		assert.equal( 1, index);

	});


});

describe("build file system", function(){

	it("should return data in right order", function(){

		var acc = [];

		nsf.traverse( data, {order:nsf.DEPTH_FIRST}, function(err, node, level){
			acc.push(node._id);
		});

		assert.deepEqual( acc, ["f1","d2","d3","d4","f2","d5","d1","c11","c12"], "Not equal");

	});


});

