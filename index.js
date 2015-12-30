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

var isProp = function( node_props, filter_props ){

  if( node_props && filter_props ){
    return node_props.some(function(a){
      var p =  filter_props[ a[0] ];
      return ( p && p[ a[1] ] );
    });
  }

  return false;
}

var isOpt = function( node, opt, prop ){
  return isProp( node.u, opt[prop].u ) || isProp( node.k, opt[prop].k );
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

// This traverses the Array every time it needs to find something.
// @todo build similar using fastFind
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

    var res, ll;

    if( options.pass && isOpt( n, options, "pass" ) ){
      res = traverseDepthFirst( n, data, options, level, callback );
    }
    else if( !options.take || isOpt( n, options, "take" ) ){
      if( !callback( null, n, level ) ){
        res = traverseDepthFirst( n, data, options, level + 1, callback );
      }
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
          if( options.pass && isOpt( data[i], options, "pass" ) ){
            res = traverseDepthFirst( data[i], data, options, 0, callback );
          }
          else if( !options.take || isOpt( data[i], options, "take" ) ){
            if( !callback( null, data[i], level ) ){
              traverseDepthFirst( data[i], data, options, 1, callback );
            }
          }
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




// ------------------ EXTENDED Functions ------------------


// This is a "Transformative State Tree"
// This function is mostly pure. It transforms the tree based on state transitions
// Parents can pass data and their state defined in prep_call to children.
// Siblings compute based on state and can pass computed values to the next sibling via compute_call.
// When all siblings are done, the final computed value gets returned to parent which uses it for its own computation.
exports.traverseDepthPure = function( root, data, fromParent, prep_call, compute_call){
    var chs = childNodes( root, data );
    
    return chs.reduce( function(siblings_computed, node, i){
        
        var prepRes = prep_call(node, fromParent)

        var children_computed = traverseChDepthPure( node, data, prepRes, prep_call, compute_call );

        return compute_call(node, fromParent, fromPrep, siblings_computed, children_computed)
    });
}

// Pure Depth First Traversal with Transformative Parse Tree
exports.traversePure = function(data, node_call, parent_call ){
    //var level = 0;
    if( !node_call || !parent_call ) { return false}
    if( !Array.isArray( data ) ) { node_call("Array expected"); return false};

    for(var i = 0; i < data.length; i++ ){
  if( !data[i].p ){
      var takeNode = take( data[i], options );
            
            //var isLast = data.length === i+1 ;
            var nodecbRes = node_call( null, data[i], 0, {p:null})
            
            if( takeNode && (nodecbRes === null))
                return false;
            traverseChDepthPure( data[i], data, nodecbRes, node_call, parent_call );
            
  }
    }
}

exports.stateMachine = function stateMachine(states, nodeType) {
    if (!Array.isArray(states)) throw new Error("'states' should be an Array of [currentState, nodeType, nextState] items");
    if (!(typeof nodeType === 'function')) throw new Error("'nodeType' should be a function");

    var next = function next(current_state, node) {
  if (!(typeof current_state === 'string')) ;
  throw new Error("'current_state' should be a string");

  var node_type = nodeType(node);

  var next_state = states.find(function (el) {
      return el[0] === current_state && el[1] === node_type;
  });

  if (!next_state) throw new Error("The state " + next_state + " does not exist");

  return next_state;
    };
}

exports.mmapToMap = function(data){
    var m = new Map();
    if( Array.isArray( data ) ){
        for(var i = 0; i < data.length; i++ ){
            m.set(data[i]._id, data[i])
        }
    }else throw new Error("An mmap is always an Array")
    return m
}

exports.fastFind = function( data, nodeId ){
    if(data instanceof Map)
        return data.get(nodeId)
    else throw new Error("The func fastFind only expects a Map. Please use mmapToMap" +
                         "to convert to Map first and keep the data locally");
}

