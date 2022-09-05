// site

const gulp = require('../node_modules/gulp');
const sass = require('gulp-sass')(require('node-sass'));
//
const chalk = require('../node_modules/chalk');
const debug = require('../node_modules/gulp-debug');
const plumber = require('../node_modules/gulp-plumber');
const mode = require('../node_modules/gulp-mode')();
const flog = require('../node_modules/fancy-log');
const newer = require('../node_modules/gulp-newer');
const htmlhint = require('../node_modules/gulp-htmlhint');
const imagemin = require('../node_modules/gulp-imagemin');
const panini = require('../node_modules/panini');
const browser = require('../node_modules/browser-sync');
const postcss = require('../node_modules/gulp-postcss');
const discardDuplicates = require('../node_modules/postcss-discard-duplicates');
const discardEmpty = require('../node_modules/postcss-discard-empty');
const orderedValues = require('../node_modules/postcss-ordered-values');
const uniqueSelectors = require('../node_modules/postcss-unique-selectors');
const gradients = require('../node_modules/postcss-easing-gradients');
const sorter = require('../node_modules/css-declaration-sorter');
const perfectionist = require('../node_modules/perfectionist');
const postcssPrettify = require('../node_modules/postcss-prettify');
const autoprefixer = require('../node_modules/autoprefixer');
const stylelint = require('../node_modules/gulp-stylelint');
const sourcemaps = require('../node_modules/gulp-sourcemaps');
const svgSprite = require('../node_modules/gulp-svg-sprite');

// Paths

const paths = {
  sassEntryPointFile: 'scss/app-site.scss',
  // sassEntryPointFile: 'scss/app-header.scss',

  // sassStandaloneFile: 'scss/standalone/new-header.scss',
  /// rename and overwrite new-header.css --> app-header.css
  //
  sassStandaloneFile: 'scss/standalone/marketplace/marketplace.scss',
  // sassStandaloneFile: 'scss/standalone/amp-article.scss',
  // sassStandaloneFile: 'scss/standalone/referral.scss',
  // sassStandaloneFile: 'scss/standalone/partner.scss',
  // sassStandaloneFile: 'scss/standalone/stream.scss',
  // sassStandaloneFile: 'scss/standalone/welcome.scss',
  // sassStandaloneFile: 'scss/standalone/support.scss',
  // sassStandaloneFile: 'scss/standalone/greenline.scss',
  // sassStandaloneFile: 'scss/standalone/itc.scss',
  // sassStandaloneFile: 'scss/standalone/kot.scss',
  // sassStandaloneFile: 'scss/standalone/team-a.scss',
  // sassStandaloneFile: 'scss/standalone/scrill-contest.scss',
  // sassStandaloneFile: 'scss/standalone/hall.scss',
  // sassStandaloneFile: 'scss/standalone/teamplay.scss',
  // sassStandaloneFile: 'scss/standalone/gift-page-pokerdom.scss',
  // sassStandaloneFile: 'scss/standalone/quiz.scss',
  // sassStandaloneFile: 'scss/standalone/app-quiz.scss',
  //
  cssDevFolder: 'dist/css',
  cssProdFolder: '/Users/axazoo/Desktop/gipsyteam_site/public/css/',
  htmlInputFiles: 'templates/**/*',
  htmlOutputFolder: 'dist',
  pagesInputFiles: 'templates/pages/**/*.html',
  imgInputFiles: 'src/nimg/**/*',
  imgOutputFolder: 'dist/nimg/',
  serverFolder: 'dist'
};

// 7-1 pattern

const sassPaths = [
  // ignore mac OS specific files
  '!../scss/**/*.DS_Store',
  '!scss/**/*.DS_Store',
  // files shared with forum
  '../scss-shared',
  //
  'scss/app-site.scss',
  'scss/utilities',
  'scss/base',
  'scss/partials',
  'scss/components',
  'scss/pages',
  // generate standalone css files
  'scss/standalone'
];

// Error

const plumberReporter = (error) => {
  flog(chalk.black.bgRed('ERR!') + (' Plumber: ') + chalk.gray(error.toString()));
};

exports.plumberReporter = plumberReporter;

// Postcss

const postcssPlugins = [
  // discardComments(),
  discardDuplicates(),
  discardEmpty(),
  orderedValues(),
  uniqueSelectors(),
  gradients({colorMode: 'lrgb'}),
  sorter({order: 'smacss'}),
  // gradient/image bug in double background-image formatting (fixed with Stylelint fix: true;)
  perfectionist({indentSize: '2', cascade: false, sourcemap: true}),
  postcssPrettify({}),
  autoprefixer({
    flexbox: false,
    grid: false,
    cascade: false
  })
];

// Styles

const styles = () => {
  return gulp.src(paths.sassEntryPointFile)
    .pipe(plumber({
      errorHandler: plumberReporter
    }))
    .pipe(mode.development(sourcemaps.init({loadMaps: true})))
    .pipe(sass({
      includePaths: sassPaths,
      outputStyle: 'expanded'
    }))
    .pipe(postcss(postcssPlugins))
    .pipe(stylelint({
      configFile: '../config/.stylelint-mapconfigrc',
      fix: false,
      failAfterError: true,
      reporters: [
        {formatter: 'verbose', console: true}
      ],
      debug: true
    }))
    .pipe(plumber.stop())
    .pipe(mode.development(sourcemaps.write('/maps')))
    .pipe(gulp.dest(paths.cssDevFolder))
    .pipe(mode.production(gulp.dest(paths.cssProdFolder)))
    .pipe(browser.stream());
};

exports.styles = styles;

//  Single styles

const singleStyles = () => {
  return gulp.src(paths.sassStandaloneFile)
    .pipe(plumber({
      errorHandler: plumberReporter
    }))
    .pipe(mode.development(sourcemaps.init({loadMaps: true})))
    .pipe(sass({
      includePaths: sassPaths
    }))
    .pipe(postcss(postcssPlugins))
    .pipe(stylelint({
      configFile: '../config/.stylelint-mapconfigrc',
      fix: true, // autofixing on
      failAfterError: true,
      reporters: [
        {formatter: 'verbose', console: true}
      ],
      debug: true
    }))
    .pipe(plumber.stop())
    .pipe(debug({
      title: chalk.white(' +')
    }))
    .pipe(mode.development(sourcemaps.write('/maps')))
    .pipe(gulp.dest(paths.cssDevFolder))
    .pipe(mode.production(gulp.dest(paths.cssProdFolder)))
    .pipe(browser.stream());
};

exports.singleStyles = singleStyles;

// Images

const images = () => {
  return gulp.src(paths.imgInputFiles)
    .pipe(newer(paths.imgOutputFolder))
    .pipe(imagemin([
        imagemin.svgo({
          plugins: [
            {removeTitle: true},
            {removeDesc: true},
            {cleanupAttrs: true},
            {inlineStyles: true},
            {cleanupIDs: false},
            {removeUnknownsAndDefaults: true}
          ]
        }),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.mozjpeg({quality: 96})
      ],
      {
        verbose: true
      }))
    .pipe(gulp.dest(paths.imgOutputFolder))
    .pipe(debug({
      title: chalk.white(' +')
    }));
};

exports.images = images;

// SVG sprite

// current sprite name
// const spriteName = 'post-widget-sprite';
// const spriteName = 'gtplus-sprite';
// const spriteName = 'ropl-sprite';
// const spriteName = 'freerolls-sprite';
// const spriteName = 'article-sprite';
// const spriteName = 'menu-sprite';
// const spriteName = 'referral-sprite';
// const spriteName = 'social-sprite';
const spriteName = 'market-sprite';
// const spriteName = 'mobile-menu-sprite';
// const spriteName = 'dropmenu-sprite';
// const spriteName = 'partner-sprite';
// const spriteName = 'stream-sprite';
// const spriteName = 'settings-sprite';
// const spriteName = 'kot-sprite';
// const spriteName = 'actions-sprite';
// const spriteName = 'bestroom-sprite';
// const spriteName = 'mainpage-sprite';
// const spriteName = 'meta-sprite';
// const spriteName = 'team-a-sprite';
// const spriteName = 'component-sprite';
// const spriteName = 'header-sprite';
// const spriteName = 'footer-sprite';
// const spriteName = 'control-sprite';
// const spriteName = 'buttons-sprite';
// const spriteName = 'auth-2fa-sprite';
// const spriteName = 'room-tag-sprite';
// const spriteName = 'welcome-sprite';
// const spriteName = 'slider-news-sprite';
// const spriteName = 'support-sprite';
// const spriteName = 'widget-promo-sprite';
// const spriteName = 'greenline-sprite';
// const spriteName = 'payments-sprite';
// const spriteName = 'blogs-battle-sprite';
//
const svgBaseDir = `src/svg/${spriteName}`;
const spriteFolder = `dist/svg/${spriteName}`;
const intermediateFolder = 'intermediate';
const svgGlob = '**/*.svg';
const svgSpriteConfig = {
  'log': 'info',
  'shape': {
    'dimension': {
      'maxWidth': 512,
      'maxHeight': 512,
      'precision': 3,
      'attributes': true
    },
    'transform': [
      {
        'svgo': {
          'plugins': [
            {
              'removeXMLNS': true
            },
            {
              'convertColors': {
                currentColor: false
              }
            }
          ]
        }
      }
    ],
    'dest': intermediateFolder
  },
  'svg': {
    'xmlDeclaration': false
  },
  'mode': {
    'symbol': {
      'dest': '',
      'prefix': '.%s',
      'dimensions': '%s',
      'sprite': `${spriteName}`,
      'inline': false,
      'example': {
        'template': 'src/svg/template.html',
        'dest': 'sprite-preview.html'
      },
      'render': {
        'css': false,
        'scss': {
          'template': 'src/svg/template.scss',
          'dest': '_sprite.scss'
        }
      }
    }
  }
};

const assembleSprite = () => {
  return gulp.src(svgGlob, {cwd: svgBaseDir})
    .pipe(plumber({
      errorHandler: plumberReporter
    }))
    .pipe(svgSprite(svgSpriteConfig)).on('error', function(error) {
      console.log(error);
    })
    .pipe(gulp.dest(spriteFolder));
};

exports.assembleSprite = assembleSprite;

// Pages

const resetPages = (done) => {
  panini.refresh();
  done();
};

exports.resetPages = resetPages;

const pages = () => {
  return gulp.src(paths.pagesInputFiles)
    .pipe(debug({
      title: '--'
    }))
    .pipe(plumber({
      errorHandler: plumberReporter
    }))
    .pipe(panini({
      root: 'templates/pages',
      data: 'templates/data',
      layouts: 'templates/layouts',
      partials: 'templates/partials/**'
    }))
    .pipe(htmlhint({
      'src-not-empty': true,
      // fix for inline SVG
      'tagname-lowercase': false,
      'attr-lowercase': false
    }))
    .pipe(htmlhint.reporter())
    .pipe(gulp.dest(paths.htmlOutputFolder));
};

exports.pages = pages;

// Server

const server = () => {
  browser.init({
    server: (paths.serverFolder),
    port: 5555,
    // proxy: 'gt/info',
    // port: 7777,
    logPrefix: (chalk.black.bgGreen(' BS ')),
    reloadOnRestart: true,
    // index: 'index.html',
    // logLevel: 'debug',
    ghostMode: false,
    // tunnel: true,
    // tunnel: 'gt',
    open: false,
    notify: false,
    // online: true,
    ui: false
  });
};

exports.server = server;

// Watch

// default
const swatch = () => {
  gulp.watch(sassPaths).on('change', gulp.series(styles));
  gulp.watch(paths.htmlInputFiles).on('change', gulp.series(resetPages, pages, browser.reload));
  gulp.watch(paths.imgInputFiles).on('change', gulp.series(images, browser.reload));
};

exports.swatch = swatch;
exports.default = gulp.series(gulp.parallel(swatch, server));

// standalone
const iwatch = () => {
  gulp.watch(sassPaths).on('change', gulp.series(singleStyles));
  gulp.watch(paths.htmlInputFiles).on('change', gulp.series(resetPages, pages, browser.reload));
  gulp.watch(paths.imgInputFiles).on('change', gulp.series(images, browser.reload));
};

exports.iwatch = iwatch;
exports.standalone = gulp.series(gulp.parallel(iwatch, server));

// sprite
const spriteServer = () => {
  browser.init({
    server: (spriteFolder),
    port: 5577,
    logPrefix: (chalk.black.bgGreen(' BS ')),
    reloadOnRestart: true,
    index: 'sprite-preview.html',
    ghostMode: false,
    open: false,
    notify: false,
    online: false,
    ui: false
  });
};

exports.spriteServer = spriteServer;

const spriteWatch = () => {
  gulp.watch(svgBaseDir).on('change', gulp.series(assembleSprite, browser.reload));
};

exports.spriteWatch = spriteWatch;
exports.sprite = gulp.series(gulp.parallel(spriteWatch, spriteServer));
