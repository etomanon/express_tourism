var gulp = require('gulp');
var less = require('gulp-less');
var server = require('gulp-develop-server');
var bs = require('browser-sync').create();  
var path = require('path');

gulp.task('less', function () {
 return gulp.src('./public/styles/*.less')
   .pipe(less({
     paths: [ path.join(__dirname, 'less', 'includes') ]
   }))
   .pipe(gulp.dest('./public/styles'))
});

  var options = {
    server: {
      path: './bin/www',
      execArgv: ['--harmony']
    },
    bs: {
      proxy: {
        target: 'http://localhost:3000',
        middleware: function (req, res, next) {
          console.log(req.url);
          next();
        }
      },
      files: ['./public/**/*', './views/**'], // files to watch with bs instantly (.ejs & .css)
      logLevel: 'debug'
    }
  };
  
  gulp.task('start', ['less'], function () {
    server.listen(options.server, function (error) {
      if (!error)
        bs.init(options.bs);
    });
    gulp.watch('./public/styles/*.less', ['less']);
    gulp.watch('./routes/**').on('change', bs.reload);
    gulp.watch('./app.js').on('change', bs.reload);
  });