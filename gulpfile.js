const proxy = 'bogun3D';
const projectName = 'bogun';
const webPackSetting = true;
const typeScriptSetting = false;

// type script
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const buffer = require('vinyl-buffer');
const glob = require('glob');
const merge = require('merge-stream');
const path = require('path');

const fs = require('fs');
const gulp = require('gulp');
const rename = require('gulp-rename');
const del = require('del');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
// pug
const pug = require('gulp-pug');
// css
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

// js
const importFile = require('gulp-file-include');
const uglify = require('gulp-uglify-es').default;

// img
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');
// svg
const svgSprites = require('gulp-svg-sprites');
const cheerio = require('gulp-cheerio');
const cleanSvg = require('gulp-cheerio-clean-svg');
// eslint
const eslint = require('gulp-eslint');

// webpack
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const paths = {
  root: `./wp-content/themes/${projectName}`,
  templateStyles: {
    main: './src/assets/s3d/styles/pages',
  },
  templates: {
    pages: './src/pug/pages/*.pug',
    src: './src/pug/**/*.pug',
    dest: `./wp-content/themes/${projectName}`,
  },
  phpTemplates: {
    src: './src/assets/s3d/template/*.php',
    dest: `./wp-content/themes/${projectName}/assets/s3d/template/`,
  },
  styles: {
    main: './src/assets/s3d/styles/main.scss',
    importsFiles: 'src/assets/s3d/styles/assets/templates.scss',
    stylesPages: 'src/assets/s3d/styles/pages',
    src: './src/**/*.scss',
    dest: `./wp-content/themes/${projectName}/assets/s3d/styles/`,
  },
  scripts: {
    src: './src/**/*.js',
    dest: `./wp-content/themes/${projectName}/assets/s3d/scripts/`,
  },
  ts: {
    src: './src/assets/s3d/scripts/gulp-modules/ts/*.ts',
    dest: `./wp-content/themes/${projectName}/assets/s3d/scripts/`,
  },
  fonts: {
    src: './src/assets/fonts/**/*',
    dest: `./wp-content/themes/${projectName}/assets/fonts`,
  },
  images: {
    src: './src/assets/s3d/images/**/*',
    dest: `./wp-content/themes/${projectName}/assets/s3d/images`,
  },
  svgSprite: {
    src: './src/assets/s3d/svg-sprite/*.svg',
    dest: './src/assets/s3d/svg-sprite/sprite/',
  },
  gulpModules: {
    src: './src/assets/s3d/scripts/gulp-modules/*.js',
    dest: `./wp-content/themes/${projectName}/assets/s3d/scripts/`,
  },
  libs: {
    src: './src/assets/s3d/scripts/libs/libs.js',
    dest: './src/assets/s3d/scripts/gulp-modules/',
  },
  static: {
    src: './src/static/**/*.*',
    dest: `./wp-content/themes/${projectName}/static/`,
  },
};

// слежка
function watch() {
  gulp.watch(paths.templateStyles.main, watchScssTemplates);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.templates.src, templates);
  gulp.watch(paths.phpTemplates.src, phpTemplates);
  if (webPackSetting) {
    gulp.watch(paths.scripts.src, scripts); // for webpack
  }
  gulp.watch(paths.gulpModules.src, gulpModules);
  if (typeScriptSetting) {
    gulp.watch(paths.ts.src, typeScript);
  }

  gulp.watch(paths.ts.src, testJsLint);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.fonts.src, fonts);
  gulp.watch(paths.libs.src, libs);
  gulp.watch(paths.static.src, staticFolder);
  gulp.watch('./src/pug/**/*.html', templates);
  gulp.watch('./src/assets/svg-sprite/*.*', svgSprite);
}

// creater templates scss

function watchScssTemplates() {
  scssTemplateCreater();
  return gulp.src(paths.templates.pages);
  // .pipe(gulp.dest(paths.root));
}

function scssTemplateCreater() {
  fs.readdir(paths.styles.stylesPages, (err, nameFiles) => {
    const filesNameWithoutExt = nameFiles.map(el => el.replace(/\.scss/g, ''));
    const contentImportsFiles = filesNameWithoutExt.reduce((acc, el) => acc += `@import './pages/${el}';\n`, '');

    fs.writeFile(contentImportsFiles, paths.styles.importsFiles, null, () => {});
  });
}

function phpTemplates() {
  return gulp.src(paths.phpTemplates.src)
    .pipe(gulp.dest(paths.phpTemplates.dest));
}

// следим за build и релоадим браузер
function server() {
  browserSync.init({
    // server: paths.root,
    notify: false,
    proxy,
  });
  browserSync.watch(`${paths.root}/**/*.*`, browserSync.reload);
}


// очистка
function clean() {
  return del(paths.root);
}

// pug
function templates() {
  return gulp.src(paths.templates.pages)
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(paths.root));
}

// eslint
function testJsLint() {
  return gulp.src(paths.ts.src)
    .pipe(eslint())
    .pipe(eslint.format());
  // .pipe(eslint.failAfterError());
}

// scss
function styles() {
  return gulp.src(paths.styles.main)
    .pipe(sourcemaps.init()) // инциализация sourcemap'ов
    .pipe(sass({
      outputStyle: 'expanded', // компиляции в CSS с отступами
    }))
    .on('error', notify.onError({
      title: 'SCSS',
      message: '<%= error.message %>', // вывод сообщения об ошибке
    }))
    .pipe(sourcemaps.write())
    .pipe(rename('s3d.min.css'))
    .pipe(gulp.dest(paths.styles.dest));
}

// fonts
function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

// php
function staticFolder() {
  return gulp.src(paths.static.src)
    .pipe(gulp.dest(paths.static.dest));
}

// svg-sprite
function svgSprite() {
  return gulp.src(paths.svgSprite.src)
  // .pipe(cheerio({
  // 	run: function ($) {
  // 		$('[fill^="#"]').removeAttr('fill');
  // 		$('[style]').removeAttr('style');
  // 	},
  // 	parserOptions: {
  // 		xmlMode: false
  // 	}
  // }))
    .pipe(svgSprites({
      mode: 'symbols',
      preview: false,
      selector: 'icon-%f',
      svg: {
        symbols: 'symbol_sprite.php',
      },
    }))
    .pipe(gulp.dest(paths.svgSprite.dest));
}

// images
function images() {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest));
}

gulp.task('clear', () => cache.clearAll());

// webpack
function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe(gulp.dest(paths.scripts.dest));
}

// gulp-scripts
function gulpModules() {
  return gulp.src(paths.gulpModules.src)
    .pipe(plumber({
      errorHandler: notify.onError({
        title: 'JavaScript',
        message: '<%= error.message %>', // выводим сообщение об ошибке
      }),
    }))
    .pipe(importFile({ //
      prefix: '@@', // импортим все файлы, описанные в результируещем js
      basepath: '@file', //
    }))
    .pipe(gulp.dest(paths.gulpModules.dest));
}


// ts-scripts
function typeScript() {
  const files = glob.sync(paths.ts.src);
  return merge(files.map(file => browserify({
    entries: file,
    debug: true,
  })
    .plugin(tsify)
    .bundle()
    .pipe(source(`${path.basename(file, '.ts')}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true,
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.ts.dest))));
}


// libs-scripts
function libs() {
  return gulp.src(paths.libs.src)
    .pipe(importFile({ //
      prefix: '@@', // импортим все файлы, описанные в результируещем js
      basepath: '@file', //
    }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.libs.dest));
}


exports.templates = templates;
exports.phpTemplates = phpTemplates;
exports.styles = styles;

const additionalTask = [];


if (webPackSetting) {
  exports.scripts = scripts;
  additionalTask.push(scripts);
}
if (typeScriptSetting) {
  exports.typeScript = typeScript;
  additionalTask.push(typeScript);
}


exports.gulpModules = gulpModules;
exports.testJsLint = testJsLint;
exports.images = images;
exports.clean = clean;
exports.fonts = fonts;
exports.svgSprite = svgSprite;
exports.libs = libs;
exports.staticFolder = staticFolder;
exports.watchScssTemplates = watchScssTemplates;


gulp.task('default', gulp.series(
  watchScssTemplates,
  svgSprite,
  clean,
  libs,
  ...additionalTask,
  gulp.parallel(styles, phpTemplates, templates, fonts, gulpModules, testJsLint, images, staticFolder),
  gulp.parallel(watch, server),
));


// -- BUILD PRODUCTION
const pathsProd = {
  root: './prod',
  templates: {
    src: `./wp-content/themes/${projectName}/s3d/*.html`,
    dest: './prod',
  },
  style: {
    src: `./wp-content/themes/${projectName}/assets/s3d/styles/*.css`,
    dest: './prod/assets/s3d/styles',
  },
  js: {
    src: `./wp-content/themes/${projectName}/assets/s3d/scripts/*.js`,
    dest: './prod/assets/s3d/scripts',
  },
  fonts: {
    src: `./wp-content/themes/${projectName}/assets/s3d/fonts/**/*`,
    dest: './prod/assets/fonts',
  },
  static: {
    src: `./wp-content/themes/${projectName}/s3d/static/**/*.*`,
    dest: './prod/static/',
  },
  images: {
    src: `./wp-content/themes/${projectName}/assets/s3d/images/**/*`,
    dest: './prod/assets/s3d/images',
  },
};
// CLEAN PROD FOLDER
function _clean() {
  return del(pathsProd.root);
}
// HTML
function _templates() {
  return gulp.src(pathsProd.templates.src)
    .pipe(gulp.dest(pathsProd.root));
}
// CSS
function _styles() {
  return gulp.src(pathsProd.style.src)
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(pathsProd.style.dest));
}

// FONTS
function _fonts() {
  return gulp.src(pathsProd.fonts.src)
    .pipe(gulp.dest(pathsProd.fonts.dest));
}

// PHP
function _static() {
  return gulp.src(pathsProd.static.src)
    .pipe(gulp.dest(pathsProd.static.dest));
}
// JS
function _scripts() {
  return gulp.src(pathsProd.js.src)
    .pipe(gulp.dest(pathsProd.js.dest));
}
// IMG
function _images() {
  return gulp.src(pathsProd.images.src)
    .pipe(cache(imagemin([
      imagemin.gifsicle({
        interlaced: true,
      }),
      imagemin.jpegtran({
        progressive: true,
      }),
      imageminJpegRecompress({
        loops: 5,
        min: 85,
        max: 95,
        quality: 'high',
      }),
      imagemin.svgo(),
      imagemin.optipng(),
      imageminPngquant({
        quality: [0.85, 0.90],
        speed: 5,
      }),
    ], {
      verbose: true,
    })))
    .pipe(gulp.dest(pathsProd.images.dest));
}

exports._templates = _templates;
exports._fonts = _fonts;
exports._static = _static;
exports._clean = _clean;
exports._scripts = _scripts;
exports._styles = _styles;
exports._images = _images;

gulp.task('prod', gulp.series(
  _clean,
  gulp.parallel(_templates, _fonts, _static, _scripts, _styles, _images),
));
