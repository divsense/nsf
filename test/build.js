var assert = require("assert");
var nsf = require("../index.js");
var compose = require("lodash.compose");

describe("makeNode", function(){

	it("should return NSF array with one node", function(){

		var set = nsf.makeNode( 12, {
				t: "Foo",
				u: {type: "command"}, 
				k: {fontstyle:"italic"} 
			})( {} );

			assert.equal( set[12].t, "Foo" );

			assert.equal( set[12].u[0][0], "type" );
			assert.equal( set[12].u[0][1], "command" );

			assert.equal( set[12].k[0][0], "fontstyle" );
			assert.equal( set[12].k[0][1], "italic" );

			assert.equal( typeof set[12].a, "undefined" );
			assert.equal( typeof set[12].b, "undefined" );

	});


});

describe("setChildNodes", function(){

	it("should return NSF array with node and its child nodes", function(){

		var set = compose( 

		   nsf.setChildNodes( 12, [13,14] )

		 , nsf.makeNode( 14, { t: "N14", u: {type: "text"} })
		 , nsf.makeNode( 13, { t: "N13", u: {type: "text"} })
		 , nsf.makeNode( 12, { t: "Foo", u: {type: "command"} })


		)( {} );

		assert.equal( set[12].t, "Foo" );
		assert.equal( set[13].t, "N13" );
		assert.equal( set[14].t, "N14" );

		assert.equal( set[12].a[0][0], "children-mmap" );
		assert.equal( set[12].a[0][1][0], 13 );
		assert.equal( set[12].a[0][1][1], 14 );

		assert.equal( typeof set[12].b, "undefined" );

	});


});

