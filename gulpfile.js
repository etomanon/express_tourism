const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const gutil = require('gulp-util')
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');
const babel = require('gulp-babel');

// Optimize Images
gulp.task('imageMin', () =>
	gulp.src('src/images/*')
		//.pipe(imagemin())
		.pipe(gulp.dest('public/images'))
);

// Bundle & minify LESS files
gulp.task('css', function(){
  return gulp.src(['src/styles/normalize.less', 'src/styles/!(style)*.less','src/styles/style.less'])
      .pipe(less())
      .pipe(autoprefixer('last 2 version'))
      .pipe(concat('main.min.css'))
      .pipe(cleanCSS())
      .pipe(gulp.dest('public/styles'))
});

// Bundle & minify JS
gulp.task('scripts', function(){
  return gulp.src(['src/js/jquery.js','src/js/leaflet.js','src/js/!(map)*.js','src/js/map.js'])
      .pipe(concat('main.min.js'))
      .pipe(sourcemaps.init())
      .pipe(babel({
        "presets": [
          ["env", {
            "modules": false
          }]
        ]
      }))
      .pipe(uglify())
      .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('public/js'))
});


// Refresh browser on change
gulp.task('browser-sync', ['nodemon'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:3000",
        files: ["public/**/*.*", "routes/**/*.*", "views/**/*.*", "app.js"],
        port: 7000,
	});
});
gulp.task('nodemon', ['imageMin'], function (cb) {
	
	var started = false;
	
	return nodemon({
		script: 'bin/www'
	}).on('start', function () {
		if (!started) {
			cb();
			started = true; 
		} 
	});
});


gulp.task('default', ['imageMin','css', 'scripts', 'watch', 'browser-sync']);

gulp.task('watch', function(){
  gulp.watch('src/js/*.js', ['scripts'])
  gulp.watch('src/images/*.png', ['imageMin'])
  gulp.watch('src/styles/*.less', ['css'])
});