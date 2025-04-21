import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:riverpodtemp/infrastructure/models/data/addons_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_information.dart';
import 'package:riverpodtemp/infrastructure/models/data/address_new_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/local_cart.dart';
import 'package:riverpodtemp/infrastructure/models/models.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/data/local_cart_model.dart';
import 'storage_keys.dart';

class LocalStorage {
  LocalStorage._();

  static SharedPreferences? _preferences;

  static init() async {
    _preferences = await SharedPreferences.getInstance();
  }

  static Future<void> setToken(String? token) async {
    if (_preferences != null) {
      await _preferences!.setString(StorageKeys.keyToken, token ?? '');
    }
  }

  static String getToken() =>
      _preferences?.getString(StorageKeys.keyToken) ?? '';

  static void deleteToken() => _preferences?.remove(StorageKeys.keyToken);

  static Future<void> setCartLocal(CartLocalModel cartLocal) async {
    if (_preferences != null) {
      // print("setCartLocal ${cartLocal.toJson()}");
      List<CartLocalModel> list = getCartLocal();
      if (cartLocal.quantity != 0) {
        if (list.toUniqueStringList().contains(cartLocal.getUniqueString())) {
          for (int i = 0; i < list.length; i++) {
            if (list[i].getUniqueString() == cartLocal.getUniqueString()) {
              list[i].quantity = cartLocal.quantity;
            }
          }
        } else {
          list.add(cartLocal);
        }
      } else {
        for (int i = 0; i < list.length; i++) {
          if (list[i].stockId == cartLocal.stockId) {
            list.removeAt(i);
          }
        }
      }

      await _preferences!.setString(StorageKeys.keyCartLocal,
          jsonEncode(CartLocalModelList(list: list).toJson()));
    }
  }

  static List<CartLocalModel> getCartLocal() {
    return _preferences?.getString(StorageKeys.keyCartLocal) != null
        ? CartLocalModelList.fromJson(jsonDecode(
                    _preferences?.getString(StorageKeys.keyCartLocal) ?? "") ??
                "")
            .list
        : [];
  }

  static void deleteCartLocal() =>
      _preferences?.remove(StorageKeys.keyCartLocal);

  static Future<void> setShopId(int? token) async {
    if (_preferences != null) {
      await _preferences!.setInt(StorageKeys.keyShopId, token ?? 0);
    }
  }

  static int getShopId() => _preferences?.getInt(StorageKeys.keyShopId) ?? 0;

  static void deleteShopId() => _preferences?.remove(StorageKeys.keyShopId);

  static Future<void> setProfileImage(String? image) async {
    if (_preferences != null) {
      await _preferences!.setString(StorageKeys.keyUserImage, image ?? '');
    }
  }

  static String getProfileImage() =>
      _preferences?.getString(StorageKeys.keyUserImage) ?? '';

  static void deleteProfileImage() =>
      _preferences?.remove(StorageKeys.keyUserImage);

  static Future<void> setSearchHistory(List<String> list) async {
    if (_preferences != null) {
      final List<String> idsStrings = list.map((e) => e.toString()).toList();
      await _preferences!
          .setStringList(StorageKeys.keySearchStores, idsStrings);
    }
  }

  static List<String> getSearchList() {
    final List<String> strings =
        _preferences?.getStringList(StorageKeys.keySearchStores) ?? [];
    return strings;
  }

  static void deleteSearchList() =>
      _preferences?.remove(StorageKeys.keySearchStores);

  static Future<void> setSavedProductsList(List<int> ids) async {
    if (_preferences != null) {
      final List<String> idsStrings = ids.map((e) => e.toString()).toList();
      await _preferences!.setStringList(StorageKeys.keySavedStores, idsStrings);
    }
  }

  static List<int> getSavedProductsList() {
    final List<String> strings =
        _preferences?.getStringList(StorageKeys.keySavedStores) ?? [];
    if (strings.isNotEmpty) {
      final List<int> ids = strings.map((e) => int.parse(e)).toList();
      return ids;
    } else {
      return [];
    }
  }

  static void deleteSavedProductsList() =>
      _preferences?.remove(StorageKeys.keySavedStores);

  static Future<void> setAddressSelected(AddressNewModel data) async {
    if (_preferences != null) {
      await _preferences!
          .setString(StorageKeys.keyAddressSelected, jsonEncode(data.toJson()));
    }
  }

  static AddressNewModel? getAddressSelected() {
    String dataString =
        _preferences?.getString(StorageKeys.keyAddressSelected) ?? "";
    if (dataString.isNotEmpty) {
      AddressNewModel data = AddressNewModel.fromJson(jsonDecode(dataString));
      return data;
    } else {
      return null;
    }
  }

  static void deleteAddressSelected() =>
      _preferences?.remove(StorageKeys.keyAddressSelected);

  static Future<void> setAddressInformation(AddressInformation data) async {
    if (_preferences != null) {
      await _preferences!.setString(
          StorageKeys.keyAddressInformation, jsonEncode(data.toJson()));
    }
  }

  static AddressInformation? getAddressInformation() {
    String dataString =
        _preferences?.getString(StorageKeys.keyAddressInformation) ?? "";
    if (dataString.isNotEmpty) {
      AddressInformation data =
          AddressInformation.fromJson(jsonDecode(dataString));
      return data;
    } else {
      return null;
    }
  }

  static void deleteAddressInformation() =>
      _preferences?.remove(StorageKeys.keyAddressInformation);

  static Future<void> setLanguageSelected(bool selected) async {
    if (_preferences != null) {
      await _preferences!.setBool(StorageKeys.keyLangSelected, selected);
    }
  }

  static bool getLanguageSelected() =>
      _preferences?.getBool(StorageKeys.keyLangSelected) ?? false;

  static void deleteLangSelected() =>
      _preferences?.remove(StorageKeys.keyLangSelected);

  static Future<void> setSelectedCurrency(CurrencyData currency) async {
    if (_preferences != null) {
      final String currencyString = jsonEncode(currency.toJson());
      await _preferences!
          .setString(StorageKeys.keySelectedCurrency, currencyString);
    }
  }

  static CurrencyData getSelectedCurrency() {
    String json =
        _preferences?.getString(StorageKeys.keySelectedCurrency) ?? '';
    if (json.isEmpty) {
      return CurrencyData();
    } else {
      final map = jsonDecode(json);
      return CurrencyData.fromJson(map);
    }
  }

  static void deleteSelectedCurrency() =>
      _preferences?.remove(StorageKeys.keySelectedCurrency);

  static Future<void> setWalletData(Wallet? wallet) async {
    if (_preferences != null) {
      final String walletString = jsonEncode(wallet?.toJson());
      await _preferences!.setString(StorageKeys.keyWalletData, walletString);
    }
  }

  static Future<void> setUser(ProfileData? user) async {
    if (_preferences != null) {
      final String userString = user != null ? jsonEncode(user.toJson()) : '';
      await _preferences!.setString(StorageKeys.keyUser, userString);
    }
  }

  static ProfileData? getUser() {
    final savedString = _preferences?.getString(StorageKeys.keyUser);
    if (savedString == null) {
      return null;
    }
    final map = jsonDecode(savedString);
    if (map == null) {
      return null;
    }
    return ProfileData.fromJson(map);
  }

  static Wallet? getWalletData() {
    final wallet = _preferences?.getString(StorageKeys.keyWalletData);
    if (wallet == null) {
      return null;
    }
    final map = jsonDecode(wallet);
    if (map == null) {
      return null;
    }
    return Wallet.fromJson(map);
  }

  static void deleteWalletData() =>
      _preferences?.remove(StorageKeys.keyWalletData);

  static Future<void> setSettingsList(List<SettingsData> settings) async {
    if (_preferences != null) {
      final List<String> strings =
          settings.map((setting) => jsonEncode(setting.toJson())).toList();
      await _preferences!.setStringList(StorageKeys.keyGlobalSettings, strings);
    }
  }

  static List<SettingsData> getSettingsList() {
    final List<String> settings =
        _preferences?.getStringList(StorageKeys.keyGlobalSettings) ?? [];
    final List<SettingsData> settingsList = settings
        .map(
          (setting) => SettingsData.fromJson(jsonDecode(setting)),
        )
        .toList();
    return settingsList;
  }

  static void deleteSettingsList() =>
      _preferences?.remove(StorageKeys.keyGlobalSettings);

  static Future<void> setTranslations(
      Map<String, dynamic>? translations) async {
    if (_preferences != null) {
      final String encoded = jsonEncode(translations);
      await _preferences!.setString(StorageKeys.keyTranslations, encoded);
    }
  }

  static Map<String, dynamic> getTranslations() {
    final String encoded =
        _preferences?.getString(StorageKeys.keyTranslations) ?? '';
    if (encoded.isEmpty) {
      return {};
    }
    final Map<String, dynamic> decoded = jsonDecode(encoded);
    return decoded;
  }

  static void deleteTranslations() =>
      _preferences?.remove(StorageKeys.keyTranslations);

  static Future<void> setAppThemeMode(bool isDarkMode) async {
    if (_preferences != null) {
      await _preferences!.setBool(StorageKeys.keyAppThemeMode, isDarkMode);
    }
  }

  static bool getAppThemeMode() =>
      CustomThemeModeX.toValue(_preferences?.getString(StorageKeys.prefKey))
          ?.isDark ??
      false;

  static void deleteAppThemeMode() =>
      _preferences?.remove(StorageKeys.keyAppThemeMode);

  static Future<void> setSettingsFetched(bool fetched) async {
    if (_preferences != null) {
      await _preferences!.setBool(StorageKeys.keySettingsFetched, fetched);
    }
  }

  static bool getSettingsFetched() =>
      _preferences?.getBool(StorageKeys.keySettingsFetched) ?? false;

  static void deleteSettingsFetched() =>
      _preferences?.remove(StorageKeys.keySettingsFetched);

  static Future<void> setLanguageData(LanguageData? langData) async {
    if (_preferences != null) {
      final String lang = jsonEncode(langData?.toJson());
      await _preferences!.setString(StorageKeys.keyLanguageData, lang);
    }
  }

  static LanguageData? getLanguage() {
    final lang = _preferences?.getString(StorageKeys.keyLanguageData);
    if (lang == null) {
      return null;
    }
    final map = jsonDecode(lang);
    if (map == null) {
      return null;
    }
    return LanguageData.fromJson(map);
  }

  static void deleteLanguage() =>
      _preferences?.remove(StorageKeys.keyLanguageData);

  static Future<void> setLangLtr(int? backward) async {
    if (_preferences != null) {
      await _preferences!.setBool(StorageKeys.keyLangLtr, backward == 0);
    }
  }

  static bool getLangLtr() =>
      _preferences?.getBool(StorageKeys.keyLangLtr) ?? true;

  static void deleteLangLtr() => _preferences?.remove(StorageKeys.keyLangLtr);

  static void setTotalCartList({required List<LocalCartModel> list}) async {
    final List<String> stringList =
        list.map((e) => jsonEncode(e.toJson())).toList();
    await _preferences!.setStringList(StorageKeys.keyCart, stringList);
  }

  static void setCartList(
      {required int? productId,
      required int? stockId,
      String? image,
      List<Addons>? addons,
      required int count}) async {
    List<LocalCartModel> list = getCartList();
    for (int i = 0; i < list.length; i++) {
      if (list[i].stockId == stockId && list[i].productId == productId) {
        if ((addons?.isEmpty ?? true) && (list[i].addons?.isEmpty ?? true)) {
          list.removeAt(i);
          list.insert(
            i,
            LocalCartModel(
                productId: productId ?? 0,
                stockId: stockId ?? 0,
                count: count,
                addons: addons,
                image: image),
          );
          final List<String> stringList =
              list.map((e) => jsonEncode(e.toJson())).toList();
          await _preferences!.setStringList(StorageKeys.keyCart, stringList);
          return;
        }

        final a = addons?.map((e) => e.stockId).toList();
        a?.sort((a, b) => a?.compareTo(b ?? 0) ?? 0);

        final b = list[i].addons?.map((e) => e.stockId).toList();
        b?.sort((a, b) => a?.compareTo(b ?? 0) ?? 0);

        if (listEquals(a, b)) {
          list.removeAt(i);
          list.insert(
            i,
            LocalCartModel(
                productId: productId ?? 0,
                stockId: stockId ?? 0,
                count: count,
                addons: addons,
                image: image),
          );
          final List<String> stringList =
              list.map((e) => jsonEncode(e.toJson())).toList();
          await _preferences!.setStringList(StorageKeys.keyCart, stringList);
          return;
        }
      }
    }
    list.add(LocalCartModel(
      productId: productId,
      stockId: stockId,
      count: count,
      image: image,
      addons: addons,
    ));
    final List<String> stringList =
        list.map((e) => jsonEncode(e.toJson())).toList();
    await _preferences!.setStringList(StorageKeys.keyCart, stringList);
  }

  static List<LocalCartModel> getCartList() {
    final List<String> listJson =
        _preferences?.getStringList(StorageKeys.keyCart) ?? [];
    if (listJson.isNotEmpty) {
      final List<LocalCartModel> list = [];
      for (var element in listJson) {
        list.add(
          LocalCartModel.fromJson(
            jsonDecode(element),
          ),
        );
      }
      return list;
    }

    return [];
  }

  static void deleteCartList() => _preferences?.remove(StorageKeys.keyCart);

  static void logout() {
    deleteWalletData();
    deleteSavedProductsList();
    deleteSearchList();
    deleteProfileImage();
    deleteToken();
    deleteCartLocal();
    _preferences?.clear();
  }
}
