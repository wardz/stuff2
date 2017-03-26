var gulp = require('gulp');
var browserify = require('gulp-browserify');

var path = './server/public/app';

gulp.task('browserify', function() {
	return gulp
		.src(path +'/app.module.js')
		.pipe(browserify())
		.pipe(gulp.dest(path + '/bin'));
});

gulp.task('watch', function() {
	gulp.watch([
		path + '/*.js', path + '/components/*/*.js',
		path + '/components/*.js', path + '/shared/*/*.js',
		path + '/shared/*.js'
	], ['browserify']);
});
