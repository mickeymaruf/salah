// Replaces the "Loading widget" text that Android shows between adding the widget and its first real drawing. The placeholder is a still copy of the widget (the card
// and two buttons) made of plain shapes, so it appears at once and the first real drawing replaces it without a jump. The colours repeat the theme tokens
// bg.surface, ink.primary (the Prayed fill), line.soft, camera.photoBackground and brand.onDark, because a config plugin cannot import the app's TypeScript theme.
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const LAYOUT = `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
  android:layout_width="match_parent"
  android:layout_height="match_parent">

  <LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical">

    <FrameLayout
      android:layout_width="match_parent"
      android:layout_height="152dp">

      <FrameLayout
        android:layout_width="match_parent"
        android:layout_height="114dp"
        android:layout_marginStart="20dp"
        android:layout_marginTop="38dp"
        android:layout_marginEnd="20dp"
        android:background="@drawable/salah_widget_back_two" />

      <FrameLayout
        android:layout_width="match_parent"
        android:layout_height="114dp"
        android:layout_marginStart="10dp"
        android:layout_marginTop="24dp"
        android:layout_marginEnd="10dp"
        android:background="@drawable/salah_widget_back_one" />

      <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="124dp"
        android:background="@drawable/salah_widget_card"
        android:orientation="vertical"
        android:paddingStart="18dp"
        android:paddingTop="16dp"
        android:paddingEnd="18dp"
        android:paddingBottom="16dp">

        <FrameLayout
          android:layout_width="36dp"
          android:layout_height="36dp"
          android:background="@drawable/salah_widget_dot" />

        <LinearLayout
          android:layout_width="match_parent"
          android:layout_height="44dp"
          android:layout_marginTop="14dp"
          android:orientation="horizontal">

          <FrameLayout
            android:layout_width="0dp"
            android:layout_height="44dp"
            android:layout_weight="1"
            android:background="@drawable/salah_widget_pill_missed" />

          <FrameLayout
            android:layout_width="0dp"
            android:layout_height="44dp"
            android:layout_marginStart="10dp"
            android:layout_weight="1"
            android:background="@drawable/salah_widget_pill_prayed" />
        </LinearLayout>
      </LinearLayout>
    </FrameLayout>
  </LinearLayout>
</FrameLayout>
`;

const shape = (body) => `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
${body}
</shape>
`;

const DRAWABLES = {
  salah_widget_card: shape('  <solid android:color="@color/salah_widget_surface" />\n  <corners android:radius="28dp" />'),
  salah_widget_back_one: shape('  <solid android:color="@color/salah_widget_surface_85" />\n  <corners android:radius="28dp" />'),
  salah_widget_back_two: shape('  <solid android:color="@color/salah_widget_surface_60" />\n  <corners android:radius="28dp" />'),
  salah_widget_dot: shape('  <solid android:color="@color/salah_widget_line" />\n  <corners android:radius="18dp" />'),
  salah_widget_pill_missed: shape(
    '  <solid android:color="@color/salah_widget_surface" />\n  <stroke android:width="1.5dp" android:color="@color/salah_widget_line" />\n  <corners android:radius="22dp" />',
  ),
  salah_widget_pill_prayed: shape('  <solid android:color="@color/salah_widget_ink_fill" />\n  <corners android:radius="22dp" />'),
};

const colorsXml = (values) => `<?xml version="1.0" encoding="utf-8"?>
<resources>
${Object.entries(values)
  .map(([name, value]) => `  <color name="${name}">${value}</color>`)
  .join('\n')}
</resources>
`;

const LIGHT = {
  salah_widget_surface: '#FFFFFF',
  salah_widget_surface_85: '#D9FFFFFF',
  salah_widget_surface_60: '#99FFFFFF',
  salah_widget_line: '#E8E4DB',
  salah_widget_ink_fill: '#1C1B19',
};

const DARK = {
  salah_widget_surface: '#1A211C',
  salah_widget_surface_85: '#D91A211C',
  salah_widget_surface_60: '#991A211C',
  salah_widget_line: '#29332E',
  salah_widget_ink_fill: '#F3F1EA',
};

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

module.exports = function withWidgetPlaceholder(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const res = path.join(modConfig.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
      write(path.join(res, 'layout', 'expo_widgets_initial_layout.xml'), LAYOUT);
      for (const [name, body] of Object.entries(DRAWABLES)) write(path.join(res, 'drawable', `${name}.xml`), body);
      write(path.join(res, 'values', 'salah_widget_colors.xml'), colorsXml(LIGHT));
      write(path.join(res, 'values-night', 'salah_widget_colors.xml'), colorsXml(DARK));
      return modConfig;
    },
  ]);
};
