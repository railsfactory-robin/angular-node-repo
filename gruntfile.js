'use strict';

module.exports = function(grunt) {
var serverStatic = require('serve-static'); //server-static ==> to run a static server

// require('time-grunt')(grunt);  // Time how long tasks take. Can help when optimizing build times

var modRewrite = require('connect-modrewrite'); // live reload ( require for connect-modewrite)

// Loading tasks
require('jit-grunt')(grunt, {
	useminPrepare: 'grunt-usemin',
	removelogging: 'grunt-remove-logging',
	filehash: 'grunt-file-hash'
});

var LocalConfig = {
	app: require('./bower.json').appPath || 'app',

// Setting develop & production paths
dev:    "app",
dist:   "public",

// Setting paths
js:     "assets/js",
sass:   "assets/sass",
css:    "assets/css",
img:    "assets/images",
fonts:  "assets/fonts"
};
var APP = {

	pkg: grunt.file.readJSON("package.json"),
	config: LocalConfig,
// Banner
meta: {
	banner:
	'/*\n' +
	' * -------------------------------------------------------\n' +
	' * <%= pkg.title %>\n' +
	' * Version: <%= pkg.version %>\n' +
	' * Site:     <%= pkg.author.url %>\n' +
	' * Contact: <%= pkg.author.email %>\n' +
	' *\n' +
	' *\n' +
	' * Modify: ' + '<%= grunt.template.today("yyyy-mm-dd h:MM:ss") %>\n' +
	' * Copyright (c) <%= grunt.template.today(\'yyyy\') %> \n' +
	' * -------------------------------------------------------\n' +
	' */\n',
},
// Clean task
// Delete files from dist or .tmp folder
clean: {
	dist: {
		src: ["<%= config.dist %>"]
	},
	tmp: {
		src: ["<%= config.dev %>/.tmp", ".sass-cache", "<%= config.dev %>/<%= config.css %>"]
	}
},
// Copy files to prod path
copy: {
	dist: {
		files: [
		{
			expand: true,
			dot: true,
			cwd: '<%= config.dev %>/',
			dest: '<%= config.dist %>/',
			src: [
			'**',
			'*.{md,txt,htaccess}',
			'!<%= config.img %>**/.{png,jpg,jpeg,gif}',
			'!_**/**',
			'!**.{html,php}',
			'!<%= config.css %>/**',
			'!assets/build-font/**',
			'!<%= config.sass %>/**',
			'!<%= config.js %>/**/**',
			'!.tmp/**',
			'!<%= config.js %>/*.js'
			],
		}
		]
	}
},
// Compiles Sass to CSS and generates necessary files if requested
compass: {
	options: {
		sassDir: '<%= config.dev %>/<%= config.sass %>',
		cssDir: '<%= config.dev %>/<%= config.css %>',
		generatedImagesDir: '.tmp/images/generated',
		javascriptsDir: '<%= config.dev %>/<%= config.js %>',
		imagesDir: '<%= config.dev %>/<%= config.img %>',
		fontsDir: '<%= config.dev %>/<%= config.fonts %>',
		importPath: './bower_components',
		httpGeneratedImagesPath: '/images/generated',
		relativeAssets: false,
		assetCacheBuster: false,
		raw: 'Sass::Script::Number.precision = 10\n'
	},
	dev: {
		options: {
			httpImagesPath: '../../images',
			httpFontsPath: '../fonts'
		}
	},
	dist: {
		options: {
			httpImagesPath: '../../assets/images',
			httpFontsPath: '../../assets/fonts'
		}
	},
	server: {
		options: {
			sourcemap: true
		}
	}
},

//minify HTML
htmlmin: {
	dist: {
		options: {
			removeComments: true,
			collapseWhitespace: false
		},
		files: [
		{
			expand: false,
			cwd: '<%= config.dev %>/',
			src: '*.{html,php}',
			dest: '<%= config.dist %>/',
		}
		],
	}
},
// imagemin
imagemin: {
	dist: {
		files: [{
			expand: false,
			cwd:  '<%= config.dev %>/<%= config.img %>',
		src: '{,*/}*.{png,jpg,jpeg,gif}',
		dest: '<%= config.dist %>/<%= config.img %>'
	}],
}
},
// Make sure code styles are up to par and there are no obvious mistakes
jshint: {
	options: {
		jshintrc: '.jshintrc',
		reporter: require('jshint-stylish')
	},
	all: {
		src: [
		'Gruntfile.js',
	'<%= config.dev %>/<%= config.js %>/{,*/}*.js'
	]
}
},

// Reads HTML for usemin blocks to enable smart builds that automatically
// concat, minify and revision files. Creates configurations in memory so
// additional tasks can operate on them
useminPrepare: {
	html: '<%= config.dev %>/index.html',
	options: {
		dest: '<%= config.dist %>',
		flow: {
			html: {
				steps: {
					js: ['concat', 'uglifyjs'],
					css: ['cssmin']
				},
				post: {}
			}
		}
	}
},

// usemin
usemin: {
	options: {
		config: ['<%= config.dist %>']
	},
html: ['<%= config.dist %>/{,*/}*.html']
},

// ng-annotate tries to make the code safe for minification automatically
// by using the Angular long form for dependency injection.
ngAnnotate: {
	dist: {
		files: [{
			expand: true,
			cwd: '.tmp/concat/assets/js',
			src: '*.js',
			dest: '.tmp/concat/assets/js'
		}]
	}
},
// watch
watch : {
	options: { livereload: true },
	css: {
		files: ["<%= config.dev %>/<%= config.sass %>/**/*.{scss,sass}"],
		tasks: ["compass:dev"]
	},
	js: {
	files: ["gruntfile.js", "<%= config.dev %>/<%= config.js %>/**/{,*/}*.js"],
//tasks: ["jshint.all"]
},
html: {
	files: [
	"/*.{html,htm,shtml,shtm,xhtml,php,jsp,asp,aspx,erb,ctp}"
	]
},
bower: {
	files: ['bower.json'],
	tasks: ['wiredep']
},
livereload: {
	options: {
		livereload: '<%= connect.options.livereload %>'
	},
	files: [
	'<%= config.dev %>/**/*.{html,php}',
'.tmp/{,*/}*.css',
'<%= config.dev %>/<%= config.img %>/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
]
}
},
// connect
connect: {
	options: {
		port: 8080,
		hostname: 'localhost',
		livereload: true
	},
	livereload: {
		options: {
			middleware: function (connect) {
				return [
				modRewrite(['^[^\\.]*$ /index.html [L]']),
				serverStatic('.tmp'),
				connect().use(
					'/bower_components',
					serverStatic('./bower_components')
					),
				connect().use(
					'/app/assets/css',
					serverStatic('./app/assets')
					),
				serverStatic(LocalConfig.app)
				];
			}
		}
	},
	dist: {
		options: {
			base: 'public'
		}
	}
},
// wiredep
wiredep: {
	task: {
		src: [
'<%= config.dev %>/**/*.html',   // .html support...
'<%= config.dev %>/<%= config.sass %>/app.scss'  // .scss & .sass support...
],
}
},

removelogging: {
	dist: {
src: ".tmp/concat/assets/js/app.min.js" // Each file will be overwritten with the output!
}
},

filehash: {
	options: {
		merge: true,
		keep: false,
		etag: "{{= +mtime}}",
		hashlen: "6"
	},
	css: {
		cwd: '<%= config.dist %>/assets',
		src: 'css/*.css',
		dest: '<%= config.dist %>/assets'
	},
	js: {
		cwd: '<%= config.dist %>/assets',
		src: 'js/*.js',
		dest: '<%= config.dist %>/assets'
	},
}

};
/*----------------
INIT CONFIG
-------------- -*/
grunt.initConfig(APP);

// Task to generate the public files
grunt.registerTask('build', [
	'clean',
	'wiredep',
	'useminPrepare',
	'compass:dist',
	'concat',
	'ngAnnotate',
	'removelogging',
	'uglify',
	'cssmin',
	'copy:dist',
	'htmlmin:dist',
	'filehash',
	'usemin',
	'imagemin:dist'
	]);

// Task for watching in development
grunt.registerTask('serve', [
	'clean:tmp',
	'compass:dev',
	'connect:livereload',
	'wiredep',
	'watch'
	]);

};