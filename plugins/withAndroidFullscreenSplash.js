const fs = require('fs');
const path = require('path');
const {
  withDangerousMod,
  withAndroidStyles,
} = require('@expo/config-plugins');

const SPLASH_SOURCE = './assets/images/splash.jpg';
const DRAWABLE_NAME = 'splashscreen_bg.jpg';
const FULLSCREEN_XML = 'splashscreen_fullscreen.xml';

const FULLSCREEN_DRAWABLE_XML = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap
      android:gravity="fill"
      android:src="@drawable/splashscreen_bg" />
  </item>
</layer-list>
`;

function upsertStyleItem(style, name, value) {
  if (!style.item) style.item = [];
  const items = Array.isArray(style.item) ? style.item : [style.item];
  const idx = items.findIndex((entry) => entry.$?.name === name);
  const next = { $: { name }, _: value };
  if (idx >= 0) items[idx] = next;
  else items.push(next);
  style.item = items;
}

function withAndroidFullscreenSplash(config) {
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const androidMain = path.join(projectRoot, 'android', 'app', 'src', 'main');
      const resDir = path.join(androidMain, 'res');
      const srcImage = path.join(projectRoot, SPLASH_SOURCE.replace('./', ''));
      const nodpiDir = path.join(resDir, 'drawable-nodpi');
      const drawableDir = path.join(resDir, 'drawable');

      fs.mkdirSync(nodpiDir, { recursive: true });
      fs.mkdirSync(drawableDir, { recursive: true });

      if (fs.existsSync(srcImage)) {
        fs.copyFileSync(srcImage, path.join(nodpiDir, DRAWABLE_NAME));
      }

      fs.writeFileSync(path.join(drawableDir, FULLSCREEN_XML), FULLSCREEN_DRAWABLE_XML, 'utf8');
      return cfg;
    },
  ]);

  config = withAndroidStyles(config, (cfg) => {
    const styles = cfg.modResults;
    const theme = styles.resources?.style?.find(
      (entry) => entry.$?.name === 'Theme.App.SplashScreen',
    );

    if (theme) {
      upsertStyleItem(theme, 'android:windowBackground', '@drawable/splashscreen_fullscreen');
      upsertStyleItem(theme, 'windowSplashScreenBackground', '@color/splashscreen_background');
      upsertStyleItem(theme, 'android:windowSplashScreenBackground', '@color/splashscreen_background');
      upsertStyleItem(theme, 'windowSplashScreenAnimatedIcon', '@android:color/transparent');
      upsertStyleItem(theme, 'android:windowSplashScreenAnimatedIcon', '@android:color/transparent');
      upsertStyleItem(theme, 'android:windowSplashScreenBehavior', 'default');
      upsertStyleItem(theme, 'postSplashScreenTheme', '@style/AppTheme');
    }

    cfg.modResults = styles;
    return cfg;
  });

  return config;
}

module.exports = withAndroidFullscreenSplash;
