var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function(){
  return gulp.src('../public/stylesheets/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(gulp.dest('../public/stylesheets'))
});
gulp.watch('../public/stylesheets/*.scss', ['sass']);