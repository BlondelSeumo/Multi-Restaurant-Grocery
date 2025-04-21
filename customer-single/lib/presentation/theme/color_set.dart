part of 'theme.dart';

class CustomColorSet {
  final Color primary;

  final Color white;

  final Color black;

  final Color textBlack;

  final Color textWhite;

  final Color error;

  final Color transparent;

  final Color categoryTitleColor;

  final Gradient whiteGradient;
  final Color backgroundColor;
  final Color scaffoldColor;
  final Color hintColor;
  final Color textColor;
  final Color socialButtonBackground;
  final Color divider;
  final Color socialTextColor;
  final Color locationItemColor;
  final Color locationItemNavigatorColor;
  final Color reviewText;
  final Color popUpColor;
  final Color buttonColor;
  final Color green;
  final Color maleButton;
  final Color editButtonColor;
  final Color commentCountColor;
  final Color borderColor;
  final Color tabTextLabelColor;
  final Color linerColor;
  final Color tabBarBackground;
  final Color marketBgColor;
  final Color red;
  final Color colorFilterButtonColor;
  final Color stockColor;
  final Color newBoxColor;
  final Color inputColor;

  CustomColorSet._({
    required this.stockColor,
    required this.inputColor,
    required this.red,
    required this.colorFilterButtonColor,
    required this.marketBgColor,
    required this.tabBarBackground,
    required this.linerColor,
    required this.tabTextLabelColor,
    required this.borderColor,
    required this.commentCountColor,
    required this.editButtonColor,
    required this.maleButton,
    required this.green,
    required this.buttonColor,
    required this.popUpColor,
    required this.reviewText,
    required this.locationItemNavigatorColor,
    required this.locationItemColor,
    required this.socialTextColor,
    required this.divider,
    required this.socialButtonBackground,
    required this.textColor,
    required this.hintColor,
    required this.scaffoldColor,
    required this.backgroundColor,
    required this.black,
    required this.textBlack,
    required this.textWhite,
    required this.primary,
    required this.white,
    required this.error,
    required this.transparent,
    required this.categoryTitleColor,
    required this.whiteGradient,
    required this.newBoxColor,
  });

  factory CustomColorSet._create(CustomThemeMode mode) {
    final isLight = mode.isLight;

    final textBlack = isLight ? AppStyle.black : AppStyle.white;

    final textWhite = isLight ? AppStyle.white : AppStyle.black;

    final categoryTitleColor =
        isLight ? AppStyle.black : AppStyle.whiteWithOpacity;

    const primary = AppStyle.primary;

    const white = AppStyle.white;

    const black = AppStyle.black;

    const error = AppStyle.red;
    const hintColor = AppStyle.hintColor;

    const transparent = AppStyle.transparent;
    const backgroundColor = AppStyle.buttonBackground;
    final scaffoldColor = isLight ? AppStyle.white : AppStyle.scaffoldColorDark;
    final newBoxColor = isLight ? AppStyle.subCategory : AppStyle.categoryDark;
    final whiteGradient = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          // backgroundColor.withOpacity(0.01),
          // backgroundColor,
        ]);

    const textColor = AppStyle.hinTextColor;

    final socialButtonBackground =
        isLight ? AppStyle.buttonBackground : AppStyle.socialButtonDark;

    final dividerColor =
        isLight ? AppStyle.black.withOpacity(0.5) : AppStyle.hintColor;

    final socialTextColor = isLight ? AppStyle.textGrey : AppStyle.white;

    final locationItemColor =
        isLight ? AppStyle.black.withOpacity(.1) : AppStyle.locationItemDark;
    final locationItemNavigatorColor =
        isLight ? AppStyle.white : AppStyle.locationNavigatorDark;

    final reviewText = AppStyle.reviewText;
    final popUpColor = isLight ? AppStyle.white : AppStyle.locationItemDark;
    final buttonColor =
        isLight ? AppStyle.locationButtonColor : AppStyle.locationItemDark;
    final green = AppStyle.green;

    final maleButton =
        isLight ? AppStyle.maleButtonColor : AppStyle.locationItemDark;
    final editButtonColor =
        isLight ? AppStyle.editButtonIcon : AppStyle.locationItemDark;

    const commentCountColor = AppStyle.commentCountColor;
    final borderColor =
        isLight ? AppStyle.black.withOpacity(.4) : AppStyle.white50;

    const tabTextLabelColor = AppStyle.tabTextLabelColor;
    final linerColor =
        isLight ? AppStyle.lineColor : AppStyle.scaffoldColorDark;

    final tabBarBackground =
        isLight ? AppStyle.white : AppStyle.locationItemDark;

    final marketBgColor = isLight ? AppStyle.white : AppStyle.locationItemDark;
    final red = AppStyle.red;
    final colorFilterButtonColor = AppStyle.colorFilterButtonColor;
    final stockColor = AppStyle.stockColor;
    final inputColor = AppStyle.inputColor;

    return CustomColorSet._(
      inputColor: inputColor,
      stockColor: stockColor,
      colorFilterButtonColor: colorFilterButtonColor,
      red: red,
      marketBgColor: marketBgColor,
      tabBarBackground: tabBarBackground,
      linerColor: linerColor,
      tabTextLabelColor: tabTextLabelColor,
      borderColor: borderColor,
      commentCountColor: commentCountColor,
      editButtonColor: editButtonColor,
      maleButton: maleButton,
      green: green,
      buttonColor: buttonColor,
      popUpColor: popUpColor,
      reviewText: reviewText,
      locationItemNavigatorColor: locationItemNavigatorColor,
      locationItemColor: locationItemColor,
      socialTextColor: socialTextColor,
      divider: dividerColor,
      socialButtonBackground: socialButtonBackground,
      textColor: textColor,
      hintColor: hintColor,
      scaffoldColor: scaffoldColor,
      backgroundColor: backgroundColor,
      black: black,
      whiteGradient: whiteGradient,
      textBlack: textBlack,
      textWhite: textWhite,
      primary: primary,
      white: white,
      error: error,
      transparent: transparent,
      categoryTitleColor: categoryTitleColor,
      newBoxColor: newBoxColor,
    );
  }

  static CustomColorSet createOrUpdate(CustomThemeMode mode) {
    return CustomColorSet._create(mode);
  }
}
