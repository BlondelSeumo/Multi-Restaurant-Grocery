class TimeInterval {
  final String? start;

  TimeInterval({this.start});


  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TimeInterval &&
          runtimeType == other.runtimeType &&
          start == other.start;

  @override
  int get hashCode => start.hashCode;

  Map<String, dynamic> toMap() {
    return {
      'start_date': start,
    };
  }

  factory TimeInterval.fromMap(Map<String, dynamic> map) {
    return TimeInterval(
      start: map['start_date'] as String?,
    );
  }
}

List<TimeInterval> getIntervalsFromNow(
    String startTime, String endTime, DateTime selectedDate) {
  List<TimeInterval> intervals = [];

  if (selectedDate.weekday != DateTime.now().weekday) {
    DateTime now = DateTime.now();
    DateTime todayEnd = DateTime(
        selectedDate.year, selectedDate.month, selectedDate.day, 23, 59, 59);

    int startHour = int.parse(startTime.split(":")[0]);
    int startMinute = int.parse(startTime.split(":")[1]);
    DateTime startDateTime = DateTime(selectedDate.year, selectedDate.month,
        selectedDate.day, startHour, startMinute);

    int endHour = int.parse(endTime.split(":")[0]);
    int endMinute = int.parse(endTime.split(":")[1]);
    DateTime endDateTime = DateTime(selectedDate.year, selectedDate.month,
        selectedDate.day, endHour, endMinute);

    if (now.isAfter(endDateTime)) {
      return intervals;
    }

    if (selectedDate.isAtSameMomentAs(now)) {
      DateTime currentStart = startDateTime;

      if (now.isAfter(startDateTime)) {
        currentStart =
            DateTime(now.year, now.month, now.day, now.hour, now.minute);
        if (currentStart.minute % 30 != 0) {
          currentStart = DateTime(now.year, now.month, now.day, now.hour,
              (now.minute ~/ 30) * 30 + 30);
        }
      }

      while (currentStart.isBefore(todayEnd) &&
          currentStart.isBefore(endDateTime)) {
        DateTime currentEnd = currentStart.add(Duration(minutes: 30));

        if (currentEnd.isAfter(endDateTime)) {
          break;
        }

        intervals.add(TimeInterval(
          start:
              "${currentStart.hour.toString().padLeft(2, '0')}:${currentStart.minute.toString().padLeft(2, '0')}",
        ));

        currentStart = currentEnd;
      }
    } else {
      DateTime currentStart = startDateTime;

      while (currentStart.isBefore(endDateTime)) {
        DateTime currentEnd = currentStart.add(Duration(minutes: 30));

        intervals.add(TimeInterval(
          start:
              "${currentStart.hour.toString().padLeft(2, '0')}:${currentStart.minute.toString().padLeft(2, '0')}",
        ));

        currentStart = currentEnd;
      }
    }
  } else {
    DateTime now = DateTime.now();
    DateTime todayEnd = DateTime(now.year, now.month, now.day, 23, 59, 59);

    int startHour = int.parse(startTime.split(":")[0]);
    int startMinute = int.parse(startTime.split(":")[1]);
    DateTime startDateTime =
        DateTime(now.year, now.month, now.day, startHour, startMinute);

    int endHour = int.parse(endTime.split(":")[0]);
    int endMinute = int.parse(endTime.split(":")[1]);
    DateTime endDateTime =
        DateTime(now.year, now.month, now.day, endHour, endMinute);

    if (now.isAfter(endDateTime)) {
      return intervals;
    }

    if (now.isBefore(todayEnd)) {
      DateTime currentStart = startDateTime;

      if (now.isAfter(startDateTime)) {
        currentStart =
            DateTime(now.year, now.month, now.day, now.hour, now.minute);
        if (currentStart.minute % 30 != 0) {
          currentStart = DateTime(now.year, now.month, now.day, now.hour,
              (now.minute ~/ 30) * 30 + 30);
        }
      }

      while (currentStart.isBefore(todayEnd) &&
          currentStart.isBefore(endDateTime)) {
        DateTime currentEnd = currentStart.add(Duration(minutes: 30));

        if (currentEnd.isAfter(endDateTime)) {
          break;
        }

        intervals.add(TimeInterval(
          start:
              "${currentStart.hour.toString().padLeft(2, '0')}:${currentStart.minute.toString().padLeft(2, '0')}",
        ));

        currentStart = currentEnd;
      }
    } else {
      DateTime currentStart = startDateTime;

      while (currentStart.isBefore(endDateTime)) {
        DateTime currentEnd = currentStart.add(Duration(minutes: 30));

        intervals.add(TimeInterval(
          start:
              "${currentStart.hour.toString().padLeft(2, '0')}:${currentStart.minute.toString().padLeft(2, '0')}",
        ));

        currentStart = currentEnd;
      }
    }
  }

  return intervals;
}
