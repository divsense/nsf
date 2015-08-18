//
// Divsense Nodes Storage Format
//
var find = require("lodash.find");

var BRANCH_CLASS = 0;
var BRANCH_NODES = 1;
var BRANCH_ID = 2;

var NO_ORDER = 0;
var LEVEL_ORDER = 1;
var DEPTH_FIRST = 2;

var takeProp = function( node_props, filter_props ){

	if( node_props && filter_props ){
		return node_props.some(function(a){
			var p =  filter_props[ a[0] ];
			return ( p && p[ a[1] ] );
		})
	}

	return true;
}

var take = function( node, opt ){

	if( opt.take && ( !takeProp( node.u, opt.take.u ) || !takeProp( node.k, opt.take.k ) ) ){
		return false;
	}
	return true;
}

var findById = function( data ){
	return function( id ){
		for(var i = 0; i < data.length; i++ ){
			if( data[i]._id === id ){
				return data[i];
			}
		}
	}
}

var childNodes = function( node, data ){

	return ( (node.a || [] ).concat( (node.b || []) ) )
			.reduce( function(m,b){
				return m.concat( b[1] );
			}, [])
			.map( findById(data) );

}

var traverseLevelOrder = function( root, data, options, level, callback ){

	var chs = childNodes( root, data );
		
	var res = chs.some( function(n){
		return !!callback( null, n, level );
	});

	if( !res ){
		res = chs.some( function(n){
			return traverseLevelOrder( n, data, options, (level + 1), callback );
		});
	}

	return res;
}

var traverseDepthFirst = function( root, data, options, level, callback ){

	var chs = childNodes( root, data );

	return chs.some( function(n){

		var takeNode = take( n, options );

		var res = takeNode && !!callback( null, n, level );

		if( !res ){
			res = traverseDepthFirst( n, data, options, level + 1, callback );
		}

		return res;

	});


}

var props = function( obj ){
	return Object.keys( obj ).reduce(function(m,a){
		m.push( [ a, obj[ a ] ] );
		return m;
	}, []);
}

var makeNode = function( id, params ){

	return function(set){

		set = set || [];

		var s = {_id: id};

		if( params.t ) s.t = params.t;

		if( params.u ) s.u = props( params.u );

		if( params.k ) s.k = props( params.k );

		set.push( s );
		return set;
	}
}

var setChildNodes = function( parentId, cids, side, branchName ){

	return function(set){

		side = side || "a";
		branchName = branchName || "children-mmap";

		var node = find( set, function(e){return e._id === parentId});

		if( node ){

			node[ side ] = node[ side ] || [];

			node[ side ].push( [ branchName, cids] );

			cids.forEach( function(id){ 

				var node = find( set, function(e){return e._id === id});
				if( node ){
					node.p = parentId;
				}

			});
		}

		return set;
	}
}

exports.LEVEL_ORDER = LEVEL_ORDER;
exports.DEPTH_FIRST = DEPTH_FIRST;

exports.traverse = function( data, options, callback ){

	var level = 0;

	if( !callback ){ return }

	options = options || {};

	var order = options.order || NO_ORDER;

	if( Array.isArray( data ) ){

		if( order === LEVEL_ORDER ){
			for(var i = 0; i < data.length; i++ ){
				if( !data[i].p ){
					if( callback( null, data[i], 0 ) ){
						return;
					}
				}
			}
			for(var i = 0; i < data.length; i++ ){
				if( !data[i].p ){
					traverseLevelOrder( data[i], data, options, 1, callback );
				}
			}
		}
		else if( order === DEPTH_FIRST ){
			for(var i = 0; i < data.length; i++ ){
				if( !data[i].p ){

					var takeNode = take( data[i], options );

					if( takeNode && callback( null, data[i], 0 ) ){
						return;
					}
					traverseDepthFirst( data[i], data, options, 1, callback );
				}
			}
		}
		else{ // no order
			for(var i = 0; i < data.length; i++ ){
				if( callback( null, data[i] ) ){
					break;
				}
			}
		}
	}
	else{
		callback("Array expected");
	}

}

exports.findIndex = function( data, options ){

	if( Array.isArray( data ) ){
		if( options.byId ){
			for(var i = 0; i < data.length; i++ ){
				if( data[i]._id === options.byId ){
					return i;
				}
			}
		}
	}
}

exports.has = function( key, value, prop ){
	return prop.some( function(p){ return (p[0] === key && p[1] === value); });
}

exports.childNodes = childNodes;

exports.makeNode = makeNode;
exports.setChildNodes = setChildNodes;

