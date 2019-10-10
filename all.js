(function( window, undefined ) {
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,
	navigator = window.navigator,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// Save a reference to some core methods
	core_push = Array.prototype.push,
	core_slice = Array.prototype.slice,
	core_indexOf = Array.prototype.indexOf,
	core_toString = Object.prototype.toString,
	core_hasOwn = Object.prototype.hasOwnProperty,
	core_trim = String.prototype.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

	// Used for detecting and trimming whitespace
	core_rnotwhite = /\S/,
	core_rspace = /\s+/,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// The ready event handler and self cleanup method
	DOMContentLoaded = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		} else if ( document.readyState === "complete" ) {
			// we're here because readyState === "complete" in oldIE
			// which is good enough for us to call the dom ready!
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	},

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context && context.nodeType ? context.ownerDocument || context : document );

					// scripts is true for back-compat
					selector = jQuery.parseHTML( match[1], doc, true );
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						this.attr.call( selector, context, true );
					}

					return jQuery.merge( this, selector );

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.8.3",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ),
			"slice", core_slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready, 1 );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ core_toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// scripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, scripts ) {
		var parsed;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			scripts = context;
			context = 0;
		}
		context = context || document;

		// Single tag
		if ( (parsed = rsingleTag.exec( data )) ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
		return jQuery.merge( [],
			(parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
	},

	parseJSON: function( data ) {
		if ( !data || typeof data !== "string") {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && core_rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || jQuery.isFunction( obj );

		if ( args ) {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.apply( obj[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( obj[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var type,
			ret = results || [];

		if ( arr != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			type = jQuery.type( arr );

			if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
				core_push.call( ret, arr );
			} else {
				jQuery.merge( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key,
			ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var exec,
			bulk = key == null,
			i = 0,
			length = elems.length;

		// Sets many values
		if ( key && typeof key === "object" ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
			}
			chainable = 1;

		// Sets one value
		} else if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = pass === undefined && jQuery.isFunction( value );

			if ( bulk ) {
				// Bulk operations only iterate when executing function values
				if ( exec ) {
					exec = fn;
					fn = function( elem, key, value ) {
						return exec.call( jQuery( elem ), value );
					};

				// Otherwise they run against the entire set
				} else {
					fn.call( elems, value );
					fn = null;
				}
			}

			if ( fn ) {
				for (; i < length; i++ ) {
					fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
				}
			}

			chainable = 1;
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready, 1 );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.split( core_rspace ), function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				return jQuery.inArray( fn, list ) > -1;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								} :
								newDefer[ action ]
							);
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		fragment,
		eventName,
		i,
		isSupported,
		clickFn,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: ( document.compatMode === "CSS1Compat" ),

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", clickFn = function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent("onclick");
		div.detachEvent( "onclick", clickFn );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	input.setAttribute( "checked", "checked" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "name", "t" );

	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for ( i in {
			submit: true,
			change: true,
			focusin: true
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, div, tds, marginDiv,
			divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// NOTE: To any future maintainer, we've window.getComputedStyle
		// because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = document.createElement("div");
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "block";
			div.style.overflow = "visible";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			container.style.zoom = 1;
		}

		// Null elements to avoid leaks in IE
		body.removeChild( container );
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	fragment.removeChild( div );
	all = a = select = opt = input = fragment = div = null;

	return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	deletedIds: [],

	// Remove at next major release (1.9/2.0)
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = jQuery.deletedIds.pop() || jQuery.guid++;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split(" ");
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject( cache[ id ] ) ) {
				return;
			}
		}

		// Destroy the cache
		if ( isNode ) {
			jQuery.cleanData( [ elem ], true );

		// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
		} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
			delete cache[ id ];

		// When all else fails, null
		} else {
			cache[ id ] = null;
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, part, attr, name, l,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attr = elem.attributes;
					for ( l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split( ".", 2 );
		parts[1] = parts[1] ? "." + parts[1] : "";
		part = parts[1] + "!";

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				data = this.triggerHandler( "getData" + part, [ parts[0] ] );

				// Try to fetch any internally stored data first
				if ( data === undefined && elem ) {
					data = jQuery.data( elem, key );
					data = dataAttr( elem, key, data );
				}

				return data === undefined && parts[1] ?
					this.data( parts[0] ) :
					data;
			}

			parts[1] = value;
			this.each(function() {
				var self = jQuery( this );

				self.triggerHandler( "setData" + part, parts );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + part, parts );
			});
		}, null, value, arguments.length > 1, null, false );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				// Only convert to a number if it doesn't change the string
				+data + "" === data ? +data :
				rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery.removeData( elem, type + "queue", true );
				jQuery.removeData( elem, key, true );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook, fixSpecified,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea|)$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( setClass.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var removes, className, elem, c, cl, i, l;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}
		if ( (value && typeof value === "string") || value === undefined ) {
			removes = ( value || "" ).split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];
				if ( elem.nodeType === 1 && elem.className ) {

					className = (" " + elem.className + " ").replace( rclass, " " );

					// loop over each item in the removal list
					for ( c = 0, cl = removes.length; c < cl; c++ ) {
						// Remove until there is nothing to remove,
						while ( className.indexOf(" " + removes[ c ] + " ") >= 0 ) {
							className = className.replace( " " + removes[ c ] + " " , " " );
						}
					}
					elem.className = value ? jQuery.trim( className ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( core_rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	// Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
	attrFn: {},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, isBool,
			i = 0;

		if ( value && elem.nodeType === 1 ) {

			attrNames = value.split( core_rspace );

			for ( ; i < attrNames.length; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					isBool = rboolean.test( name );

					// See #9699 for explanation of this approach (setting first, then removal)
					// Do not do this for boolean attributes (see #10870)
					if ( !isBool ) {
						jQuery.attr( elem, name, "" );
					}
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( isBool && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true,
		coords: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.value = value + "" );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var t, tns, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, "events", true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
			type = event.type || event,
			namespaces = [];

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			for ( old = elem; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old === (elem.ownerDocument || document) ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
			handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = core_slice.call( arguments ),
			run_all = !event.exclusive && !event.namespace,
			special = jQuery.event.special[ event.type ] || {},
			handlerQueue = [];

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers that should run if there are delegated events
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !(event.button && event.type === "click") ) {

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

				// Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					selMatch = {};
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];
						sel = handleObj.selector;

						if ( selMatch[ sel ] === undefined ) {
							selMatch[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( selMatch[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, matches: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
		event.metaKey = !!event.metaKey;

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "_submit_attached" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "_submit_attached", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "_change_attached", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) { // && selector != null
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var cachedruns,
	assertGetIdNotName,
	Expr,
	getText,
	isXML,
	contains,
	compile,
	sortOrder,
	hasDuplicate,
	outermostContext,

	baseHasDuplicate = true,
	strundefined = "undefined",

	expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

	Token = String,
	document = window.document,
	docElem = document.documentElement,
	dirruns = 0,
	done = 0,
	pop = [].pop,
	push = [].push,
	slice = [].slice,
	// Use a stripped-down indexOf if a native one is unavailable
	indexOf = [].indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	// Augment a function for special use by Sizzle
	markFunction = function( fn, value ) {
		fn[ expando ] = value == null || value;
		return fn;
	},

	createCache = function() {
		var cache = {},
			keys = [];

		return markFunction(function( key, value ) {
			// Only keep the most recent entries
			if ( keys.push( key ) > Expr.cacheLength ) {
				delete cache[ keys.shift() ];
			}

			// Retrieve with (key + " ") to avoid collision with native Object.prototype properties (see Issue #157)
			return (cache[ key + " " ] = value);
		}, cache );
	},

	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// Regex

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments not in parens/brackets,
	//   then attribute selectors and non-pseudos (denoted by :),
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

	// For matchExpr.POS and matchExpr.needsContext
	pos = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
		"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

	rnot = /^:not/,
	rsibling = /[\x20\t\r\n\f]*[+~]/,
	rendsWithNot = /:not\($/,

	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,

	rbackslash = /\\(?!\\)/g,

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"POS": new RegExp( pos, "i" ),
		"CHILD": new RegExp( "^:(only|nth|first|last)-child(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
	},

	// Support

	// Used for testing something on an element
	assert = function( fn ) {
		var div = document.createElement("div");

		try {
			return fn( div );
		} catch (e) {
			return false;
		} finally {
			// release memory in IE
			div = null;
		}
	},

	// Check if getElementsByTagName("*") returns only elements
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	}),

	// Check if getAttribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Check if attributes should be retrieved by attribute nodes
	assertAttributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	}),

	// Check if getElementsByClassName can be trusted
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	}),

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	assertUsableName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = document.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			document.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			document.getElementsByName( expando + 0 ).length;
		assertGetIdNotName = !document.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

// If slice is not available, provide a backup
try {
	slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		for ( ; (elem = this[i]); i++ ) {
			results.push( elem );
		}
		return results;
	};
}

function Sizzle( selector, context, results, seed ) {
	results = results || [];
	context = context || document;
	var match, elem, xml, m,
		nodeType = context.nodeType;

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	xml = isXML( context );

	if ( !xml && !seed ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	} else {

		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	}
	return ret;
};

isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b && b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	docElem.compareDocumentPosition ?
	function( a, b ) {
		return b && !!( a.compareDocumentPosition( b ) & 16 );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.attr = function( elem, name ) {
	var val,
		xml = isXML( elem );

	if ( !xml ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( xml || assertAttributes ) {
		return elem.getAttribute( name );
	}
	val = elem.getAttributeNode( name );
	return val ?
		typeof elem[ name ] === "boolean" ?
			elem[ name ] ? name : null :
			val.specified ? val.value : null :
		null;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	// IE6/7 return a modified href
	attrHandle: assertHrefNotNormalized ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		},

	find: {
		"ID": assertGetIdNotName ?
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );

					return m ?
						m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
							[m] :
							undefined :
						[];
				}
			},

		"TAG": assertTagNameNoComments ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( tag );
				}
			} :
			function( tag, context ) {
				var results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					var elem,
						tmp = [],
						i = 0;

					for ( ; (elem = results[i]); i++ ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			},

		"NAME": assertUsableName && function( tag, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				return context.getElementsByName( name );
			}
		},

		"CLASS": assertUsableClassName && function( className, context, xml ) {
			if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
				return context.getElementsByClassName( className );
			}
		}
	},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				3 xn-component of xn+y argument ([+-]?\d*n|)
				4 sign of xn-component
				5 x of xn-component
				6 sign of y-component
				7 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1] === "nth" ) {
				// nth-child requires argument
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
				match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

			// other types prohibit arguments
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var unquoted, excess;
			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			if ( match[3] ) {
				match[2] = match[3];
			} else if ( (unquoted = match[4]) ) {
				// Only check arguments that contain a pseudo
				if ( rpseudo.test(unquoted) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					unquoted = unquoted.slice( 0, excess );
					match[0] = match[0].slice( 0, excess );
				}
				match[2] = unquoted;
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {
		"ID": assertGetIdNotName ?
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					return elem.getAttribute("id") === id;
				};
			} :
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}
			nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ expando ][ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem, context ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.substr( result.length - check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.substr( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, argument, first, last ) {

			if ( type === "nth" ) {
				return function( elem ) {
					var node, diff,
						parent = elem.parentNode;

					if ( first === 1 && last === 0 ) {
						return true;
					}

					if ( parent ) {
						diff = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								diff++;
								if ( elem === node ) {
									break;
								}
							}
						}
					}

					// Incorporate the offset (or cast to NaN), then check against cycle size
					diff -= last;
					return diff === first || ( diff % first === 0 && diff / first >= 0 );
				};
			}

			return function( elem ) {
				var node = elem;

				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						if ( type === "first" ) {
							return true;
						}

						node = elem;

						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						return true;
				}
			};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			var nodeType;
			elem = elem.firstChild;
			while ( elem ) {
				if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
					return false;
				}
				elem = elem.nextSibling;
			}
			return true;
		},

		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"text": function( elem ) {
			var type, attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				(type = elem.type) === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
		},

		// Input types
		"radio": createInputPseudo("radio"),
		"checkbox": createInputPseudo("checkbox"),
		"file": createInputPseudo("file"),
		"password": createInputPseudo("password"),
		"image": createInputPseudo("image"),

		"submit": createButtonPseudo("submit"),
		"reset": createButtonPseudo("reset"),

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"focus": function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		"active": function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		},

		// Positional types
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 0; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 1; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

function siblingCheck( a, b, ret ) {
	if ( a === b ) {
		return ret;
	}

	var cur = a.nextSibling;

	while ( cur ) {
		if ( cur === b ) {
			return -1;
		}

		cur = cur.nextSibling;
	}

	return 1;
}

sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
			a.compareDocumentPosition :
			a.compareDocumentPosition(b) & 4
		) ? -1 : 1;
	} :
	function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	hasDuplicate = baseHasDuplicate;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ expando ][ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			tokens.push( matched = new Token( match.shift() ) );
			soFar = soFar.slice( matched.length );

			// Cast descendant combinators to space
			matched.type = match[0].replace( rtrim, " " );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {

				tokens.push( matched = new Token( match.shift() ) );
				soFar = soFar.slice( matched.length );
				matched.type = type;
				matched.matches = match;
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && combinator.dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( checkNonElements || elem.nodeType === 1  ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( !xml ) {
				var cache,
					dirkey = dirruns + " " + doneName + " ",
					cachedkey = dirkey + cachedruns;
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( (cache = elem[ expando ]) === cachedkey ) {
							return elem.sizset;
						} else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
							if ( elem.sizset ) {
								return elem;
							}
						} else {
							elem[ expando ] = cachedkey;
							if ( matcher( elem, context, xml ) ) {
								elem.sizset = true;
								return elem;
							}
							elem.sizset = false;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( matcher( elem, context, xml ) ) {
							return elem;
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && tokens.slice( 0, i - 1 ).join("").replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && tokens.join("")
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Nested matchers should use non-integer dirruns
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.E);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = superMatcher.el;
			}

			// Add elements passing elementMatchers directly to results
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					for ( j = 0; (matcher = elementMatchers[j]); j++ ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++superMatcher.el;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				for ( j = 0; (matcher = setMatchers[j]); j++ ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	superMatcher.el = 0;
	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ expando ][ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed, xml ) {
	var i, tokens, token, type, find,
		match = tokenize( selector ),
		j = match.length;

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !xml &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( rbackslash, "" ), context, xml )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().length );
			}

			// Fetch a seed set for right-to-left matching
			for ( i = matchExpr["POS"].test( selector ) ? -1 : tokens.length - 1; i >= 0; i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( rbackslash, "" ),
						rsibling.test( tokens[0].type ) && context.parentNode || context,
						xml
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && tokens.join("");
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		xml,
		results,
		rsibling.test( selector )
	);
	return results;
}

if ( document.querySelectorAll ) {
	(function() {
		var disconnectedMatch,
			oldSelect = select,
			rescape = /'|\\/g,
			rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

			// qSa(:focus) reports false when true (Chrome 21), no need to also add to buggyMatches since matches checks buggyQSA
			// A support test would require too much code (would include document ready)
			rbuggyQSA = [ ":focus" ],

			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			// A support test would require too much code (would include document ready)
			// just skip matchesSelector for :active
			rbuggyMatches = [ ":active" ],
			matches = docElem.matchesSelector ||
				docElem.mozMatchesSelector ||
				docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector ||
				docElem.msMatchesSelector;

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE9 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<p test=''></p>";
			if ( div.querySelectorAll("[test^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'/>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		// rbuggyQSA always contains :focus, so no need for a length check
		rbuggyQSA = /* rbuggyQSA.length && */ new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, xml ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !xml && !rbuggyQSA.test( selector ) ) {
				var groups, i,
					old = true,
					nid = expando,
					newContext = context,
					newSelector = context.nodeType === 9 && selector;

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					groups = tokenize( selector );

					if ( (old = context.getAttribute("id")) ) {
						nid = old.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", nid );
					}
					nid = "[id='" + nid + "'] ";

					i = groups.length;
					while ( i-- ) {
						groups[i] = nid + groups[i].join("");
					}
					newContext = rsibling.test( selector ) && context.parentNode || context;
					newSelector = groups.join(",");
				}

				if ( newSelector ) {
					try {
						push.apply( results, slice.call( newContext.querySelectorAll(
							newSelector
						), 0 ) );
						return results;
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							context.removeAttribute("id");
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, xml );
		};

		if ( matches ) {
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				try {
					matches.call( div, "[test!='']:sizzle" );
					rbuggyMatches.push( "!=", pseudos );
				} catch ( e ) {}
			});

			// rbuggyMatches always contains :active and :focus, so no need for a length check
			rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

			Sizzle.matchesSelector = function( elem, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace( rattributeQuotes, "='$1']" );

				// rbuggyMatches always contains :active, so no need for an existence check
				if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && !rbuggyQSA.test( expr ) ) {
					try {
						var ret = matches.call( elem, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11 ) {
							return ret;
						}
					} catch(e) {}
				}

				return Sizzle( expr, null, null, [ elem ] ).length > 0;
			};
		}
	})();
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Back-compat
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, l, length, n, r, ret,
			self = this;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		ret = this.pushStack( "", "find", selector );

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rcheckableType = /^(?:checkbox|radio)$/,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
		}
	},

	after: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( elem.getElementsByTagName( "*" ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		if ( !isDisconnected( this[0] ) ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		}

		return this.length ?
			this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
			this;
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = [].concat.apply( [], args );

		var results, first, fragment, iNoClone,
			i = 0,
			value = args[0],
			scripts = [],
			l = this.length;

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call( this, i, table ? self.html() : undefined );
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			results = jQuery.buildFragment( args, this, scripts );
			fragment = results.fragment;
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				// Fragments from the fragment cache must always be cloned and never used in place.
				for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						i === iNoClone ?
							fragment :
							jQuery.clone( fragment, true, true )
					);
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;

			if ( scripts.length ) {
				jQuery.each( scripts, function( i, elem ) {
					if ( elem.src ) {
						if ( jQuery.ajax ) {
							jQuery.ajax({
								url: elem.src,
								type: "GET",
								dataType: "script",
								async: false,
								global: false,
								"throws": true
							});
						} else {
							jQuery.error("no ajax");
						}
					} else {
						jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
					}

					if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				});
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	if ( nodeName === "object" ) {
		// IE6-10 improperly clones children of object elements using classid.
		// IE10 throws NoModificationAllowedError if parent is null, #12132.
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;

	// IE blanks contents when cloning scripts
	} else if ( nodeName === "script" && dest.text !== src.text ) {
		dest.text = src.text;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
	var fragment, cacheable, cachehit,
		first = args[ 0 ];

	// Set context from what may come in as undefined or a jQuery collection or a node
	// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
	// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
	context = context || document;
	context = !context.nodeType && context[0] || context;
	context = context.ownerDocument || context;

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		// Mark cacheable and look for a hit
		cacheable = true;
		fragment = jQuery.fragments[ first ];
		cachehit = fragment !== undefined;
	}

	if ( !fragment ) {
		fragment = context.createDocumentFragment();
		jQuery.clean( args, context, fragment, scripts );

		// Update the cache, but only store false
		// unless this is a second parsing of the same content
		if ( cacheable ) {
			jQuery.fragments[ first ] = cachehit && fragment;
		}
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			l = insert.length,
			parent = this.length === 1 && this[0].parentNode;

		if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
			insert[ original ]( this[0] );
			return this;
		} else {
			for ( ; i < l; i++ ) {
				elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			clone;

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
			safe = context === document && safeFragment,
			ret = [];

		// Ensure that context is a document
		if ( !context || typeof context.createDocumentFragment === "undefined" ) {
			context = document;
		}

		// Use the already-created safe fragment if context permits
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Ensure a safe container in which to render the html
					safe = safe || createSafeFragment( context );
					div = context.createElement("div");
					safe.appendChild( div );

					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Go to html and back, then peel off extra wrappers
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					depth = wrap[0];
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						hasBody = rtbody.test(elem);
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;

					// Take out of fragment container (we need a fresh div each time)
					div.parentNode.removeChild( div );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				jQuery.merge( ret, elem );
			}
		}

		// Fix #11356: Clear elements from safeFragment
		if ( div ) {
			elem = div = safe = null;
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				if ( jQuery.nodeName( elem, "input" ) ) {
					fixDefaultChecked( elem );
				} else if ( typeof elem.getElementsByTagName !== "undefined" ) {
					jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
				}
			}
		}

		// Append elements to a provided document fragment
		if ( fragment ) {
			// Special handling of each script element
			handleScript = function( elem ) {
				// Check if we consider it executable
				if ( !elem.type || rscriptType.test( elem.type ) ) {
					// Detach the script and store it in the scripts array (if provided) or the fragment
					// Return truthy to indicate that it has been handled
					return scripts ?
						scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
						fragment.appendChild( elem );
				}
			};

			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				// Check if we're done after handling an executable script
				if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
					// Append to fragment and handle embedded scripts
					fragment.appendChild( elem );
					if ( typeof elem.getElementsByTagName !== "undefined" ) {
						// handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
						jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

						// Splice the scripts into ret after their former ancestor and advance our index beyond them
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						i += jsTags.length;
					}
				}
			}
		}

		return ret;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var data, id, elem, type,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( elem.removeAttribute ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						jQuery.deletedIds.push( id );
					}
				}
			}
		}
	}
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
	function jQuerySub( selector, context ) {
		return new jQuerySub.fn.init( selector, context );
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init( selector, context ) {
		if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
			context = jQuerySub( context );
		}

		return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

	eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var elem, display,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		values[ index ] = jQuery._data( elem, "olddisplay" );
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && elem.style.display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {
			display = curCSS( elem, "display" );

			if ( !values[ index ] && display !== "none" ) {
				jQuery._data( elem, "olddisplay", display );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state, fn2 ) {
		var bool = typeof state === "boolean";

		if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
			return eventsToggle.apply( this, arguments );
		}

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;

				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, numeric, extra ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( numeric || extra !== undefined ) {
			num = parseFloat( val );
			return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	curCSS = function( elem, name ) {
		var ret, width, minWidth, maxWidth,
			computed = window.getComputedStyle( elem, null ),
			style = elem.style;

		if ( computed ) {

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	curCSS = function( elem, name ) {
		var left, rsLeft,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
			Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			// we use jQuery.css instead of curCSS here
			// because of the reliableMarginRight CSS hook!
			val += jQuery.css( elem, extra + cssExpand[ i ], true );
		}

		// From this point on we use curCSS for maximum performance (relevant in animations)
		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		valueIsBorderBox = true,
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox
		)
	) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	if ( elemdisplay[ nodeName ] ) {
		return elemdisplay[ nodeName ];
	}

	var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
		display = elem.css("display");
	elem.remove();

	// If the simple way fails,
	// get element's real default display by attaching it to a temp iframe
	if ( display === "none" || display === "" ) {
		// Use the already-created iframe if possible
		iframe = document.body.appendChild(
			iframe || jQuery.extend( document.createElement("iframe"), {
				frameBorder: 0,
				width: 0,
				height: 0
			})
		);

		// Create a cacheable copy of the iframe document on first call.
		// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
		// document to it; WebKit & Firefox won't allow reusing the iframe document.
		if ( !iframeDoc || !iframe.createElement ) {
			iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
			iframeDoc.write("<!doctype html><html><body>");
			iframeDoc.close();
		}

		elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

		display = curCSS( elem, "display" );
		document.body.removeChild( iframe );
	}

	// Store the correct default display
	elemdisplay[ nodeName ] = display;

	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
					return jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					});
				} else {
					return getWidthOrHeight( elem, name, extra );
				}
			}
		},

		set: function( elem, value, extra ) {
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
				style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						return curCSS( elem, "marginRight" );
					}
				});
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						var ret = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i,

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ],
				expanded = {};

			for ( i = 0; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType, list, placeBefore,
			dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
			i = 0,
			length = dataTypes.length;

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var selection,
		list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters );

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	// Don't do a request if no elements are being requested
	if ( !this.length ) {
		return this;
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// Request the remote document
	jQuery.ajax({
		url: url,

		// if "type" variable is undefined, then "GET" method will be used
		type: type,
		dataType: "html",
		data: params,
		complete: function( jqXHR, status ) {
			if ( callback ) {
				self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
			}
		}
	}).done(function( responseText ) {

		// Save response for use in complete callback
		response = arguments;

		// See if a selector was specified
		self.html( selector ?

			// Create a dummy div to hold the results
			jQuery("<div>")

				// inject the contents of the document in, removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				.append( responseText.replace( rscript, "" ) )

				// Locate the specified elements
				.find( selector ) :

			// If not, just inject the full result
			responseText );

	});

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // ifModified key
			ifModifiedKey,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || strAbort;
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ ifModifiedKey ] = modified;
					}
					modified = jqXHR.getResponseHeader("Etag");
					if ( modified ) {
						jQuery.etag[ ifModifiedKey ] = modified;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.always( tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already and return
				return jqXHR.abort();

		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	var conv, conv2, current, tmp,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ],
		converters = {},
		i = 0;

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
var oldCallbacks = [],
	rquestion = /\?/,
	rjsonp = /(=)\?(?=&|$)|\?\?/,
	nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		data = s.data,
		url = s.url,
		hasCallback = s.jsonp !== false,
		replaceInUrl = hasCallback && rjsonp.test( url ),
		replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
			!( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
			rjsonp.test( data );

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;
		overwritten = window[ callbackName ];

		// Insert callback into url or form data
		if ( replaceInUrl ) {
			s.url = url.replace( rjsonp, "$1" + callbackName );
		} else if ( replaceInData ) {
			s.data = data.replace( rjsonp, "$1" + callbackName );
		} else if ( hasCallback ) {
			s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});
var xhrCallbacks,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									try {
										responses.text = xhr.responseText;
									} catch( e ) {
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback, 0 );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	}, 0 );
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		index = 0,
		tweenerIndex = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end, easing ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			anim: animation,
			queue: animation.opts.queue,
			elem: elem
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	var index, prop, value, length, dataShow, toggle, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.done(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery.removeData( elem, "fxshow", true );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing any value as a 4th parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, false, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ||
			// special check for .toggle( handler, handler, ... )
			( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations resolve immediately
				if ( empty ) {
					anim.stop( true );
				}
			};

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	if ( (body = doc.body) === elem ) {
		return jQuery.offset.bodyOffset( elem );
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== "undefined" ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	clientTop  = docElem.clientTop  || body.clientTop  || 0;
	clientLeft = docElem.clientLeft || body.clientLeft || 0;
	scrollTop  = win.pageYOffset || docElem.scrollTop;
	scrollLeft = win.pageXOffset || docElem.scrollLeft;
	return {
		top: box.top  + scrollTop  - clientTop,
		left: box.left + scrollLeft - clientLeft
	};
};

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.body;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					 top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, value, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

let imgBase={
	身:'data:image/png;base64,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',
	头:'data:image/png;base64,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',
	闭眼头:'data:image/png;base64,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'
};
let PtImg;
PtImg=function(filename){
	let img=new Image();
	img.src=filename;
	let ans=[];
	let imgload=false;
	img.onload=function(){
		imgload=true;
		let canvas=document.createElement('canvas');
		canvas.width=img.width;
		canvas.height=img.height;
		let ctx=canvas.getContext('2d');
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.drawImage(img,0,0);
		ans=ctx.getImageData(0,0,img.width,img.height).data;
	}
	this.getColor=function(x,y){
		let getVC=function(x,y){
			if(!imgload||x<0||x>=img.width||y<0||y>=img.height){
				return {r:0,g:0,b:0,a:0};
			}
			let vp=(y*img.width+x)*4;
			return {r:ans[vp],g:ans[vp+1],b:ans[vp+2],a:ans[vp+3]};
		}
		let lx=parseInt(x+0.5);
		let ly=parseInt(y+0.5);
		return getVC(lx,ly);
	}
}
let Live;

Live=function(element){
	const WIDTH=300;
	const HEIGHT=400;
	const thisLine=this;
	
	let canvas;
	let mouse;
	let lastPaintTime;
	let ctx;
	
	this.init=function(){
		element.style.position='fixed';
		$(element).width(WIDTH);
		$(element).height(HEIGHT);
		$(element).css('right',0);
		$(element).css('bottom',0);
		canvas=document.createElement('canvas');
		canvas.width=WIDTH;
		canvas.height=HEIGHT;
		element.appendChild(canvas);
		mouse={x:0,y:0};
		ctx=canvas.getContext('2d');
		lastPaintTime=new Date().getTime();
		this.initAct();
	}
	
	let 身;
	let 头;
	let 闭眼头;
	
	const pc={x:133,y:60,r:65};
	let type;
	this.initAct=function(){
		身=new PtImg(imgBase.身);
		头=new PtImg(imgBase.头);
		闭眼头=new PtImg(imgBase.闭眼头);
		type={
			x:pc.x,
			y:pc.y,
			状态:'正常',
			持续时间:0
		};
	}
	this.runAct=function(time){
		type.持续时间+=time;
		if(type.状态=='正常'){
			if(type.持续时间>300){
				if(Math.random()<0.2){
					type.状态='闭眼';
					type.头混合=0;
				}
				type.持续时间=0;
			}
		}else if(type.状态=='闭眼'){
			if(type.持续时间<1000){
				type.头混合+=time*(1/1000);
				if(type.头混合>1)type.头混合=1;
			}else if(type.持续时间<1500){
			}else if(type.持续时间<2000){
				type.头混合-=time*(1/500);
				if(type.头混合<0)type.头混合=0;
			}else{
				type.状态='正常';
				type.持续时间=0;
			}
		}
		time=Math.min(time,200);
		let dis=function(x1,y1,x2,y2){
			return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		}
		let k=dis(mouse.x,mouse.y,pc.x,pc.y);
		if(k!=0)k=5/k;
		type.x+=time/300*((mouse.x-pc.x)*k+pc.x-type.x);
		type.y+=time/300*((mouse.y-pc.y)*k+pc.y-type.y);
	}
	$(window).mousemove(function(event){
		mouse={
			x:event.clientX-$(window).width()+WIDTH,
			y:event.clientY-$(window).height()+HEIGHT
		};
	});
	let p=0;
	this.paint=function(){
		let thisPaintTime=new Date().getTime();
		let deltaPaintTime=thisPaintTime-lastPaintTime;
		this.runAct(deltaPaintTime);
		let gro=ctx.createImageData(WIDTH,HEIGHT);
		let drawPoint=function(x,y,color){
			if(color.a<200)return;
			if(x>=0&&x<WIDTH&&y>=0&&y<HEIGHT){
				let vp=(y*WIDTH+x)*4;
				gro.data[vp]=color.r;
				gro.data[vp+1]=color.g;
				gro.data[vp+2]=color.b;
				gro.data[vp+3]=color.a;
			}
		}
		let dis=function(x1,y1,x2,y2){
			return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
		}
		let et=function(x,y){
			if(x==type.x&&y==type.y){
				return {x:pc.x,y:pc.y};
			}
			if(dis(x,y,type.x,type.y)>2*pc.r)return {x:x,y:y};
			let l=1e-6,r=400;
			x-=type.x;
			y-=type.y;
			while(Math.abs(r-l)>1e-6){
				let mid=(l+r)/2;
				if(dis(x*mid+type.x,y*mid+type.y,pc.x,pc.y)<=pc.r){
					l=mid;
				}else{
					r=mid;
				}
			}
			return {x:pc.x+x+(type.x-pc.x)/l,y:pc.y+y+(type.y-pc.y)/l};
		}
		let qt=function(x,y){
			let e=140;
			let u=(type.x-e)/2+e;
			if(x==u){
				return {x:x,y:y};
			}else if(x<u){
				return {x:x/u*e,y:y};
			}else{
				return {x:WIDTH-(WIDTH-x)/(WIDTH-u)*(WIDTH-e),y:y};
			}
		}
		let mix=function(cola,colb,mxb){
			return {
				r:parseInt(cola.r*(1-mxb)+colb.r*mxb),
				g:parseInt(cola.g*(1-mxb)+colb.g*mxb),
				b:parseInt(cola.b*(1-mxb)+colb.b*mxb),
				a:parseInt(cola.a*(1-mxb)+colb.a*mxb)
			};
		}
		for(let x=0;x<WIDTH;x++){
			for(let y=0;y<HEIGHT;y++){
				let v=qt(x,y);
				let color=身.getColor(v.x,v.y);
				drawPoint(x,y,color);
			}
		}
		if(type.状态=='闭眼'){
			for(let x=WIDTH/3;x<WIDTH*2/3;x++){
				for(let y=0;y<HEIGHT/3;y++){
					let v=et(x,y);
					drawPoint(x,y,mix(头.getColor(v.x,v.y),闭眼头.getColor(v.x,v.y),type.头混合));
				}
			}
		}else{
			for(let x=WIDTH/3;x<WIDTH*2/3;x++){
				for(let y=0;y<HEIGHT/3;y++){
					let v=et(x,y);
					drawPoint(x,y,头.getColor(v.x,v.y));
				}
			}
		}
		ctx.putImageData(gro,0,0);
		lastPaintTime=thisPaintTime;
	}
	this.init();
}
let live=new Live(document.getElementById('live'));
(function anim(){
	live.paint();
	setTimeout(anim,50);
})();