module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		uglify: {
			target: {
				files: {
					'server/public/app/bin/app.module.min.js': ['server/public/app/bin/app.module.js']
				}
			}
		},

		cssmin: {
			target: {
				files: {
					'server/public/css/main.min.css': ['server/public/css/main.css']
				}
			}
		},

		processhtml: {
			target: {
				files: {
					'server/public/index.procc.html': ['server/public/index.html']
				}
			}
		},

		htmlmin: {
			target: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					// TODO add angular html templates
					'server/public/index.min.html': 'server/public/index.procc.html'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');

	grunt.registerTask('default', [
		'uglify',
		'cssmin',
		'processhtml',
		'htmlmin' // Note: needs to always be after processhtml
	]);
};
