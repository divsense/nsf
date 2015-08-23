var assert = require("assert");
var nsf = require("../index.js");
var data_1 = require("./data1.json");
var data_2 = require("./data2.json");
var data_3 = require("./data3.json");

describe("childNodes", function(){

	it("should return array of child nodes", function(){

		var nodes = nsf.childNodes( data_1[0], data_1 );

		assert.equal( nodes[0]._id, "d2" );
		assert.equal( nodes[1]._id, "d3" );
		assert.equal( nodes[2]._id, "d4" );

	});


});

describe("traverse, no order", function(){

	it("should return data in right order", function(){

		var acc = [];

		nsf.traverse( data_1, {}, function(err, node){
			acc.push(node._id);
		});

		assert.deepEqual( acc, ["f1","f2","d1","d4","d3","d2","d5","c11","c12","c41"], "Not equal");

	});


});

describe("traverse, level order", function(){

	it("should return data in right order", function(){

		var acc = [];

		nsf.traverse( data_1, {order:nsf.LEVEL_ORDER}, function(err, node, level){
			acc.push(node._id);
		});

		assert.deepEqual( acc, ["f1","f2","d1","d2","d3","d4","c41","d5","c11","c12"], "Not equal");

	});


});

describe("traverse, depth first", function(){

	it("should return data in right order", function(){

		var acc = [];

		nsf.traverse( data_1, {order:nsf.DEPTH_FIRST}, function(err, node, level){
			acc.push(node._id);
		});

		assert.deepEqual( acc, ["f1","d2","d3","d4","c41","f2","d5","d1","c11","c12"], "Not equal");

	});


});

describe("find, by ID", function(){

	it("should return node index", function(){

		var index = nsf.findIndex( data_1, {byId: "f2"} );

		assert.equal( 1, index);

	});


});

describe("take", function(){

	var options = {
		order: nsf.DEPTH_FIRST,

		take: {
			u: {
				   type: {
							folder: true,
							doc: true
						 }

			   }
		}
	};

	it("should return filtered nodes", function(){

		var acc = [];

		nsf.traverse( data_2, options, function(err, node, level){
			acc.push(node._id);
		});
		assert.deepEqual( acc, ["f1","f2","d1","d2","d3","f3","d4","d5"], "Not equal");

	});

	it("should return right order of levels", function(){

		var memo = 0;
		var levels = [];
		var diffs = [];
		var acc = [];
		var outs = [];

		nsf.traverse( data_2, options, function(err, node, level){

			levels.push( level );

			var diff = memo - level;
			memo = level;

			diffs.push( diff );

			while( diff-- >= 0 ){
				acc.pop();
			}

			acc.push( node._id );

			outs.push( acc.slice(0) );

		});

		assert.deepEqual( levels, [ 0, 1, 2, 2, 1, 0, 1, 0 ], "NE levels" );
		assert.deepEqual( diffs,  [ 0, -1, -1, 0, 1, 1, -1, 1 ], "NE diffs" );

		assert.deepEqual( outs,  [ 
				                  ["f1"], ["f1","f2"], ["f1","f2","d1"], ["f1","f2","d2"], 
								          ["f1","d3"],
								  ["f3"], ["f3","d4"],
								  ["d5"]
								  ], "NE");


	});


});

describe("take & pass", function(){

	var options = {
		order: nsf.DEPTH_FIRST,

		take: {
			u: {
				   type: {
							folder: true,
							doc: true
						 }

			   }
		},

		pass: {
			u: { type: { text: true } }

			  }
	};

	var levels = [];

	nsf.traverse( data_3, options, function(err, node, level){
		levels.push( level );
	});

	assert.deepEqual( levels, [ 0, 1, 2, 2, 1, 0, 1, 0 ], "NE levels" );


});


