
import 'package:flutter/material.dart';
import 'package:riverpodtemp/infrastructure/services/enums.dart';

class SocialModel {
  final IconData iconData;
  final String title;
  final SocialType type;

  const SocialModel({
    required this.type,
    required this.iconData,
    required this.title,
  });
}
