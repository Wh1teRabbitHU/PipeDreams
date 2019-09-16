'use strict';

const del        = require('del');
const browserify = require('browserify');
const bsync      = require('browser-sync');
const globify    = require('require-globify');
const source     = require('vinyl-source-stream');
const buffer     = require('vinyl-buffer');

const gulp       = require('gulp');
const stylus     = require('gulp-stylus');
const sourcemaps = require('gulp-sourcemaps');
const composer   = require('gulp-uglify/composer');
const uglifyEs   = require('uglify-es');
const concatCss  = require('gulp-concat-css');
const cleanCss   = require('gulp-clean-css');

const uglifyEs6   = composer(uglifyEs, console);

let browserSync = bsync.create();

gulp.task('clean', () => {
	return del('./release/**/*');
});

gulp.task('static-files', () => {
	return gulp
		.src('./src/static/**/*')
		.pipe(gulp.dest('./release'));
});

gulp.task('stylus', () => {
	return gulp.src('./src/stylus/main.styl')
		.pipe(sourcemaps.init())
		.pipe(stylus())
		.pipe(concatCss('main.min.css'))
		.pipe(cleanCss())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./release/css'));
});

gulp.task('js', () => {
	let bundle = browserify('./src/main.js', {
		debug: true,
		cache: {},
		packageCache: {}
	}).transform(globify);

	let errorCached = false;

	return bundle
		.bundle()
		.on('error', (err) => {
			if (!errorCached) {
				console.error('Unexpected error occured while building the project!');
				console.error('Message:\n', err.message);
				console.error('Stacktrace:\n', err.stack);

				errorCached = true;
			}
		})
		.pipe(source('main.min.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(uglifyEs6())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./release/js'))
		.pipe(bsync.stream({ once: true }));
});

gulp.task('browser-sync', (done) => {
	browserSync.init({
		server: {
			baseDir: './release'
		}
	});

	done();
});

gulp.task('browser-reload', (done) => {
	browserSync.reload();

	done();
});

gulp.task('watch', () => {
	gulp.watch('./src/**/*', gulp.series('compile', 'browser-reload'));
});

gulp.task('compile', gulp.series('clean', gulp.parallel('static-files', 'stylus', 'js')));
gulp.task('default', gulp.series('compile', 'browser-sync', 'watch'));