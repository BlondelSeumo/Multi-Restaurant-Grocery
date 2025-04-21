import 'dart:io' show Platform;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'package:riverpodtemp/presentation/theme/app_style.dart';

class Loading extends StatelessWidget {
  final Color bgColor;
  const Loading({super.key,  this.bgColor = AppStyle.textGrey});

  @override
  Widget build(BuildContext context) {
    return  SizedBox(
      height: MediaQuery.sizeOf(context).height*0.3,
      child: Center(
        child: Platform.isAndroid
            ?  const CircularProgressIndicator()
            :  CupertinoActivityIndicator(
          color: bgColor,
          radius: 12,
        ),
      ),
    );
  }
}
