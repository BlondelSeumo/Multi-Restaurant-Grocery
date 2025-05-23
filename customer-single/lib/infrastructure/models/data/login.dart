import 'package:riverpodtemp/infrastructure/services/app_validators.dart';

class LoginModel {
  final String? email;
  final String? password;

  LoginModel({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{};
    AppValidators.isValidEmail(email ?? "")
        ? (map['email'] = email)
        : (map['phone'] = email?.replaceAll('+', ''));
    map['password'] = password;
    return map;
  }
}
