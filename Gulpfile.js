/* eslint global-require: 0 */
/* eslint import/no-unresolved: 0 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const mocha = require('gulp-mocha');
const del = require('del');
const eslint = require('gulp-eslint');

function clean(cb) {
  return del(['lib', cb]);
}

function lint() {
  return gulp
    .src([
      'src/**/*.js',
      'test/**/*.js',
      'Gulpfile.js',
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function build() {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('lib'));
}

gulp.task('build', gulp.series(clean, lint), build);

function test() {
  process.env.NODE_ENV = 'test';
  return gulp
    .src('test/**.js')
    .pipe(mocha({
      ui: 'bdd',
      reporter: 'spec',
      timeout: typeof v8debug === 'undefined' ? 2000 : Infinity, // NOTE: disable timeouts in debug
    }));
}

gulp.task('test', gulp.series(build), test);

function preview() {
  const { buildReporterPlugin } = require('testcafe').embeddingUtils;
  const pluginFactory = require('./lib');
  const reporterTestCalls = require('./test/utils/reporter-test-calls');
  const plugin = buildReporterPlugin(pluginFactory);

  reporterTestCalls.forEach((call) => {
    plugin[call.method](...call.args);
  });
  process.exit(0);
}

gulp.task('preview', gulp.series(build), preview);

exports.default = clean;

module.exports = {
  preview,
  build,
  test,
  clean,
  lint,
};
