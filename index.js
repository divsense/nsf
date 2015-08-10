//
// Divsense Nodes Storage Format
//

var BRANCH_CLASS = 0;
var BRANCH_NODES = 1;
var BRANCH_ID = 2;

var NO_ORDER = 0;
var LEVEL_ORDER = 1;
var DEPTH_FIRST = 2;

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

		var res = !!callback( null, n, level );

		if( !res ){
			res = traverseDepthFirst( n, data, options, (level + 1), callback );
		}

		return res;

	});


}

exports.LEVEL_ORDER = LEVEL_ORDER;
exports.DEPTH_FIRST = DEPTH_FIRST;

exports.traverse = function( data, options, callback ){

	var level = 0;

	if( !callback ){ return };

	options = options || {};

	var order = options.order || NO_ORDER;

	if( Array.isArray( data ) ){

		if( order === LEVEL_ORDER ){
			for(var i = 0; i < data.length; i++ ){
				if( !data[i].p ){
					if( callback( null, data[i] ) ){
						return;
					}
				}
			}
			for(var i = 0; i < data.length; i++ ){
				if( !data[i].p ){
					traverseLevelOrder( data[i], data, options, 0, callback );
				}
			}
		}
		else if( order === DEPTH_FIRST ){
			for(var i = 0; i < data.length; i++ ){
				if( !data[i].p ){
					if( callback( null, data[i] ) ){
						return;
					}
					traverseDepthFirst( data[i], data, options, 0, callback );
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

exports.childNodes = childNodes;

