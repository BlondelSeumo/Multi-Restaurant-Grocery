import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpodtemp/infrastructure/models/data/careers_data.dart';
import 'package:riverpodtemp/infrastructure/models/data/careers_detail_data.dart';

part 'careers_state.freezed.dart';

@freezed
class CareersState with _$CareersState {
  const factory CareersState({
    @Default(false) isLoading,
    @Default([]) List<DataModel> careers,
    @Default(null) CareersDataModel? careersDetail,
  }) = _CareersState;

  const CareersState._();
}
