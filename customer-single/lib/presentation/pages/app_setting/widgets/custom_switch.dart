import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/infrastructure/services/app_helpers.dart';
import 'package:riverpodtemp/infrastructure/services/local_storage.dart';
import 'package:riverpodtemp/infrastructure/services/tr_keys.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';
import 'package:riverpodtemp/presentation/theme/theme.dart';

class CustomSwitch extends StatefulWidget {
  final bool isOn;
  final Function(bool) onChanged;
  final CustomColorSet colors;

  const CustomSwitch({
    super.key,
    required this.isOn,
    required this.colors,
    required this.onChanged,
  });

  @override
  State<CustomSwitch> createState() => _CustomSwitchState();
}

class _CustomSwitchState extends State<CustomSwitch> {
  double dragPosition = 0.0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragUpdate: (details) {
        setState(() {
          dragPosition += details.delta.dx;
        });
      },
      onHorizontalDragEnd: (details) {
        if (dragPosition > 10) {
          widget.onChanged(true);
        } else if (dragPosition < -10) {
          widget.onChanged(false);
        }
        setState(() {
          dragPosition = 0.0;
        });
      },
      child: Stack(
        children: [
          Container(
            width: 80.r,
            height: 32.r,
            padding: EdgeInsets.symmetric(horizontal: 12.r),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(24.r),
            ),
            child: Row(
              mainAxisAlignment: widget.isOn && !LocalStorage.getLangLtr()
                  ? MainAxisAlignment.end
                  : !widget.isOn && !LocalStorage.getLangLtr()
                      ? MainAxisAlignment.start
                      : widget.isOn
                          ? MainAxisAlignment.start
                          : MainAxisAlignment.end,
              children: [
                if (widget.isOn)
                  Text(
                    AppHelpers.getTranslation(TrKeys.dark),
                    style: AppStyle.interNormal(size: 12),
                  ),
                if (!widget.isOn)
                  Text(
                    AppHelpers.getTranslation(TrKeys.light),
                    style: AppStyle.interNormal(size: 12),
                  ),
              ],
            ),
          ),
          AnimatedPositioned(
            duration: Duration(milliseconds: 300),
            left: widget.isOn ? 44.r : 4.r,
            right: !widget.isOn ? 46.r : 4.r,
            top: 4.r,
            bottom: 4.r,
            child: Container(
              width: 20.r,
              height: 20.r,
              decoration: BoxDecoration(
                color: widget.isOn ? Colors.grey[500] : widget.colors.primary,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Icon(
                widget.isOn ? Icons.dark_mode : Icons.pause,
                color: widget.colors.white,
                size: 16.r,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
