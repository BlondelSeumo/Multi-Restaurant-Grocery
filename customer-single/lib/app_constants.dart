import 'package:flutter_remix/flutter_remix.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';

import 'infrastructure/models/data/socials_model.dart';
import 'infrastructure/services/tr_keys.dart';

abstract class AppConstants {
  AppConstants._();

  static const bool isDemo = true;
  static const SignUpType signUpType = SignUpType.both;
  static const int scheduleInterval = 60;

  /// api urls
  static const String baseUrl = 'https://single-api.foodyman.org';
  static const String googleApiKey = 'AIzaSyDfe-B3bRqFV6yNU3t7rhMR4Nsm_kzsaf4';
  static const String privacyPolicyUrl = '$baseUrl/privacy-policy';
  static const String adminPageUrl = 'https://single-admin.foodyman.org/';
  static const String webUrl = 'https://single.foodyman.org/';
  static const String dynamicPrefix = 'https://foodymansingle.page.link';
  static const String firebaseWebKey =
      'AIzaSyBgp-Y1H1fZwwfKuneopikYQcF1Kbcs0cg';
  static const String drawingBaseUrl = 'https://api.openrouteservice.org';
  static const String routingKey =
      '5b3ce3597851110001cf62480384c1db92764d1b8959761ea2510ac8';


  /// auth phone fields
  static const bool isNumberLengthAlwaysSame = true;
  static const String countryCodeISO = 'UZ';
  static const bool showFlag = true;
  static const bool showArrowIcon = false;
  static const bool isPhoneFirebase = false;

  // PayFast
  static const String passphrase = 'PASSPHRASE';
  static const String merchantId = 'MERCHANT_ID';
  static const String merchantKey = 'MERCHANT_KEY';

  static const double radius = 14;

  static const List<SocialModel> socials = [
    SocialModel(
      iconData: FlutterRemix.google_fill,
      title: "Google",
      type: SocialType.google,
    ),
    SocialModel(
      iconData: FlutterRemix.facebook_fill,
      title: "Facebook",
      type: SocialType.facebook,
    ),
    SocialModel(
      iconData: FlutterRemix.apple_fill,
      title: "Apple",
      type: SocialType.apple,
    ),
  ];



  /// location
  static const double demoLatitude = 41.304223;
  static const double demoLongitude = 69.2348277;
  static const double pinLoadingMin = 0.116666667;
  static const double pinLoadingMax = 0.611111111;

  static const String demoUserLogin = 'user@githubit.com';
  static const String demoUserPassword = 'githubit';

  static const Duration timeRefresh = Duration(seconds: 50);

  static List<String> genderList = [TrKeys.male, TrKeys.female];
}
