import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:riverpodtemp/infrastructure/models/data/help_data.dart';
import 'package:riverpodtemp/infrastructure/models/response/admin_response.dart';

part 'help_state.freezed.dart';

@freezed
class HelpState with _$HelpState {
  const factory HelpState({
    @Default(false) bool isLoading,
    @Default(null) HelpModel? data,
    @Default(null) AdminData? adminData,
  }) = _HelpState;

  const HelpState._();
}
