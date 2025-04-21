part of 'theme.dart';

class _ThemePreference {
  final SharedPreferences _preferences;

  static const prefKey = 'theme_mode';

  _ThemePreference._(this._preferences);

  static Future<_ThemePreference> get create async {
    final preference = await SharedPreferences.getInstance();
    return _ThemePreference._(preference);
  }

  CustomThemeMode? getMode() {
    final modeKey = _preferences.getString(_ThemePreference.prefKey);

    return CustomThemeModeX.toValue(modeKey);
  }

  Future<void> setMode(CustomThemeMode mode) async {
    await _preferences.setString(_ThemePreference.prefKey, mode.toKey);
  }

  Future<void> clean() async {
    await _preferences.clear();
  }
}

extension CustomThemeModeX on CustomThemeMode {
  static const light = 'light';
  static const dark = 'dark';

  bool get isLight => this == CustomThemeMode.light;

  bool get isDark => this == CustomThemeMode.dark;

  String get toKey => toString().split('.')[1];

  static CustomThemeMode? toValue(String? key) {
    if (key == light) {
      return CustomThemeMode.light;
    } else if (key == dark) {
      return CustomThemeMode.dark;
    }
    return null;
  }
}

enum CustomThemeMode { light, dark }
