/// <binding ProjectOpened='watch' />
var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var inject = require('gulp-inject');
var typescript = require('gulp-tsc');
var angularFilesort = require('gulp-angular-filesort');

var paths = {
    sass: ['./scss/**/*.scss'],
    javascript: [
        './www/**/*.js',
        '!./www/lib/**'
    ],
    css: [
        './www/**/*.css',
        '!./www/css/ionic.app*.css',
        '!./www/lib/**'
    ],
    typescript: [
        './scripts/**/*.ts'
    ]
};



gulp.task('default', ['sass', "compile" ,'index', 'watch']);


gulp.task('index', function () {
    return gulp.src('./www/index.html')
      .pipe(inject(
        gulp.src(paths.javascript).pipe(angularFilesort()),
          { relative: true }))
      .pipe(gulp.dest('./www'))
      .pipe(inject(
        gulp.src(paths.css,
          { read: false }), { relative: true }))
      .pipe(gulp.dest('./www'));
});

gulp.task('sass', function (done) {
    gulp.src('./scss/ionic.app.scss')
      .pipe(sass())
      .on('error', sass.logError)
      .pipe(gulp.dest('./www/css/'))
      .pipe(minifyCss({
          keepSpecialComments: 0
      }))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest('./www/css/'))
      .on('end', done);
});

gulp.task('compile', function () {
    gulp.src(['./scripts/**/*.ts'])
        .pipe(typescript())
        .pipe(gulp.dest('./www/js/'));
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.typescript, ['compile']);
    gulp.watch([
      paths.javascript,
      paths.css]
      , ['index']);
});

gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
      .on('log', function (data) {
          gutil.log('bower', gutil.colors.cyan(data.id), data.message);
      });
});



gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
          '  ' + gutil.colors.red('Git is not installed.'),
          '\n  Git, the version control system, is required to download Ionic.',
          '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
          '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
