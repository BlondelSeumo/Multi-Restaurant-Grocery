import 'package:intl/intl.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';

abstract class TimeService {
  TimeService._();

  static final String _timeFormat =
      AppHelpers.getHourFormat24() ? 'HH:mm' : 'h:mm a';

  static DateTime dateFormatYMD(DateTime? time) {
    return DateTime.tryParse(
            DateFormat("yyyy-MM-dd").format(time ?? DateTime.now())) ??
        DateTime.now();
  }

  static DateTime dateFormatYMDTime(DateTime? time) {
    return DateTime.tryParse(DateFormat("dd-MM-yyyy $_timeFormat")
            .format(time ?? DateTime.now())) ??
        DateTime.now();
  }

  static String dateFormatYMDTimes(DateTime? time) {
    return DateFormat("yyyy-MM-dd $_timeFormat").format(time ?? DateTime.now());
  }

  static String dateFormatYMDss(DateTime? time) {
    return DateFormat("dd-MM-yyyy").format(time ?? DateTime.now());
  }

  static String dateFormatDMYs(DateTime? time) {
    return DateFormat("dd-MM-yyyy").format(time ?? DateTime.now());
  }

  static String dateFormatMDYHm(DateTime? time) {
    return DateFormat("d MMM, yyyy - $_timeFormat")
        .format(time ?? DateTime.now());
  }

  static String dateFormatDMY(DateTime? time) {
    return DateFormat("d MMM, yyyy").format(time ?? DateTime.now());
  }

  static String dateFormatDMYNew(DateTime? time) {
    return DateFormat("d.MM.yy").format(time ?? DateTime.now());
  }

  static String dateFormatMD(DateTime? time) {
    return DateFormat("dd MMMM").format(time ?? DateTime.now());
  }

  static String dateFormatEMDString(DateTime? time) {
    return DateFormat("dd MMM, EEEE").format(time ?? DateTime.now());
  }

  static DateTime dateFormatEMD(DateTime? time) {
    return DateTime.tryParse(
            DateFormat("dd MMM, EEEE").format(time ?? DateTime.now())) ??
        DateTime.now();
  }

  static String dateFormatMDHm(DateTime? time) {
    return DateFormat("dd MMM, $_timeFormat").format(time ?? DateTime.now());
  }

  static String dateFormatEE(DateTime? time) {
    return DateFormat("EEEE").format(time ?? DateTime.now());
  }

  static String dateFormatMMMDDHHMM(DateTime? time) {
    return DateFormat("dd, MMM $_timeFormat").format(time ?? DateTime.now());
  }

  static String dateFormatDM(DateTime? time) {
    if (DateTime.now().year == time?.year) {
      return DateFormat("d MMMM").format(time ?? DateTime.now());
    }
    return DateFormat("d MMMM, yyyy").format(time ?? DateTime.now());
  }

  static String timeFormat(DateTime? time) {
    return DateFormat(_timeFormat).format(time ?? DateTime.now());
  }

  static String timeFormatResponse(DateTime? time) {
    return DateFormat('HH:mm').format(time ?? DateTime.now());
  }

  static String dateFormatForChat(DateTime? time) {
    if ((DateTime.now().difference(time ?? DateTime.now()).inHours) > 24 &&
        (DateTime.now().difference(time ?? DateTime.now()).inDays) < 7) {
      return DateFormat("EEEE").format(time ?? DateTime.now());
    }
    if ((DateTime.now().difference(time ?? DateTime.now()).inDays) > 7) {
      return DateFormat("d/MMM/yyyy").format(time ?? DateTime.now());
    }
    return DateFormat(_timeFormat).format(time ?? DateTime.now());
  }

  static String dateFormatForNotification(DateTime? time) {
    return DateFormat("d MMM, $_timeFormat").format(time ?? DateTime.now());
  }

  static String formatHHMMSS(int seconds) {
    seconds = (seconds % 3600).truncate();
    int minutes = (seconds / 60).truncate();
    String minutesStr = (minutes).toString().padLeft(2, '0');
    String secondsStr = (seconds % 60).toString().padLeft(2, '0');
    return "$minutesStr:$secondsStr";
  }

  static String timeFormatTime(String? time) {
    if (!(time?.contains('-') ?? false)) {
      return time ?? '';
    }
    return DateFormat(_timeFormat).format(
        DateTime.now().add(Duration(days: 1)).copyWith(
            hour: int.tryParse(time!.substring(0, time.indexOf('-'))) ?? 0,
            minute:
            int.tryParse(time.substring(time.indexOf('-')+1, time.length)) ??
                0));
  }
}
