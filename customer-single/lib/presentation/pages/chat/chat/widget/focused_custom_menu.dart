// ignore_for_file: library_private_types_in_public_api, no_logic_in_create_state
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:riverpodtemp/app_constants.dart';
import 'package:riverpodtemp/presentation/components/custom_scaffold/custom_scaffold.dart';
import 'package:riverpodtemp/presentation/theme/app_style.dart';

class FocusedMenuHolderController {
  late _FocusedMenuHolderState _widgetState;
  bool _isOpened = false;

  bool get isOpened => _isOpened;

  void _addState(_FocusedMenuHolderState widgetState) {
    _widgetState = widgetState;
  }

  open() async {
    if (!_isOpened) {
      _isOpened = true;
      await _widgetState.openMenu(_widgetState.context);
    }
  }

  close() {
    if (_isOpened) {
      _isOpened = false;
      Navigator.pop(_widgetState.context);
    }
  }

  void dispose() {
    close();
  }
}

class FocusedMenuHolder extends StatefulWidget {
  final FocusedMenuHolderController? controller;
  final double? menuItemExtent;
  final double? menuWidth;
  final List<FocusedMenuItem> menuItems;
  final bool? animateMenuItems;
  final BoxDecoration? menuBoxDecoration;
  final Duration? duration;
  final double? blurSize;
  final Color? blurBackgroundColor;
  final Color? borderColor;
  final double widthBorder;
  final double? bottomOffsetHeight;
  final double? menuOffset;
  final bool open;
  final bool enableMenuScroll;
  final Widget child;

  const FocusedMenuHolder({
    required this.menuItems,
    required this.child,
    this.controller,
    this.duration,
    this.menuBoxDecoration,
    this.menuItemExtent,
    this.animateMenuItems,
    this.blurSize,
    this.blurBackgroundColor,
    this.borderColor = Colors.white,
    this.widthBorder = 2,
    this.menuWidth,
    this.bottomOffsetHeight,
    this.menuOffset,
    this.open = true,
    this.enableMenuScroll = true,
    super.key,
  });

  @override
  _FocusedMenuHolderState createState() => _FocusedMenuHolderState(controller);
}

class _FocusedMenuHolderState extends State<FocusedMenuHolder> {
  FocusedMenuHolderController? controller;
  GlobalKey containerKey = GlobalKey();
  Offset childOffset = const Offset(0, 0);
  Size? childSize;

  _FocusedMenuHolderState(FocusedMenuHolderController? focusController) {
    if (focusController != null) {
      controller = focusController;
      controller?._addState(this);
    }
  }

  getOffset() {
    RenderBox renderBox =
        containerKey.currentContext!.findRenderObject() as RenderBox;
    Size size = renderBox.size;
    Offset offset = renderBox.localToGlobal(Offset.zero);
    setState(() {
      childOffset = Offset(offset.dx, offset.dy);
      childSize = size;
    });
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        key: containerKey,
        onLongPress: () async {
          if (widget.open) {
            await openMenu(context);
          }
        },
        child: widget.child);
  }

  Future<void> openMenu(BuildContext context) async {
    getOffset();
    await Navigator.push(
        context,
        PageRouteBuilder(
            transitionDuration:
                widget.duration ?? const Duration(milliseconds: 100),
            pageBuilder: (context, animation, secondaryAnimation) {
              animation = Tween(begin: 0.0, end: 1.0).animate(animation);
              return FadeTransition(
                  opacity: animation,
                  child: FocusedMenuDetails(
                    controller: widget.controller,
                    itemExtent: widget.menuItemExtent,
                    menuBoxDecoration: widget.menuBoxDecoration,
                    childOffset: childOffset,
                    childSize: childSize,
                    menuItems: widget.menuItems,
                    blurSize: widget.blurSize,
                    menuWidth: widget.menuWidth,
                    blurBackgroundColor: widget.blurBackgroundColor,
                    borderColor: widget.borderColor,
                    widthBorder: widget.widthBorder,
                    animateMenu: widget.animateMenuItems ?? true,
                    bottomOffsetHeight: widget.bottomOffsetHeight ?? 0,
                    menuOffset: widget.menuOffset ?? 0,
                    enableMenuScroll: widget.enableMenuScroll,
                    child: widget.child,
                  ));
            },
            fullscreenDialog: true,
            opaque: false));
  }
}

class FocusedMenuDetails extends StatefulWidget {
  final FocusedMenuHolderController? controller;
  final List<FocusedMenuItem> menuItems;
  final BoxDecoration? menuBoxDecoration;
  final Offset childOffset;
  final double? itemExtent;
  final Size? childSize;
  final Widget child;
  final bool animateMenu;
  final double? blurSize;
  final double? menuWidth;
  final Color? blurBackgroundColor;
  final Color? borderColor;
  final double widthBorder;
  final double? bottomOffsetHeight;
  final double? menuOffset;
  final bool? enableMenuScroll;

  const FocusedMenuDetails({
    required this.menuItems,
    required this.child,
    required this.childOffset,
    required this.childSize,
    required this.menuBoxDecoration,
    required this.itemExtent,
    required this.animateMenu,
    required this.blurSize,
    required this.blurBackgroundColor,
    required this.borderColor,
    required this.menuWidth,
    this.widthBorder = 2,
    this.controller,
    this.bottomOffsetHeight,
    this.menuOffset,
    this.enableMenuScroll = true,
    super.key,
  });

  @override
  State<FocusedMenuDetails> createState() => _FocusedMenuDetailsState();
}

class _FocusedMenuDetailsState extends State<FocusedMenuDetails> {
  late int _indexSelected;
  late int _firstItem;
  late int _lastItem;

  void _getNextPosition({
    required bool increment,
  }) {
    setState(() {
      if (increment) {
        for (int i = _indexSelected + 1; i < widget.menuItems.length; i++) {
          final item = widget.menuItems[i];
          if (item.onPressed != null) {
            _indexSelected = i;
            return;
          }
        }
        _indexSelected = _firstItem;
      } else {
        for (int i = _indexSelected - 1; i >= 0; i--) {
          final item = widget.menuItems[i];
          if (item.onPressed != null) {
            _indexSelected = i;
            return;
          }
        }
        _indexSelected = _lastItem;
      }
    });
  }

  @override
  void initState() {
    _firstItem = widget.menuItems.indexWhere((item) => item.onPressed != null);
    _lastItem =
        widget.menuItems.lastIndexWhere((item) => item.onPressed != null);
    _indexSelected =
        widget.menuItems.indexWhere((item) => item.isDefaultAction == true);

    if (_indexSelected == -1 && _firstItem != -1) {
      _indexSelected = _firstItem;
    }

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    Size size = MediaQuery.sizeOf(context);
    final maxMenuHeight = size.height * 0.45;
    final listHeight = widget.menuItems.length * (widget.itemExtent ?? 50.0);

    final maxMenuWidth = widget.menuWidth ?? (size.width * 0.70);
    final menuHeight = listHeight < maxMenuHeight ? listHeight : maxMenuHeight;
    final leftOffset = (widget.childOffset.dx + maxMenuWidth) < size.width
        ? widget.childOffset.dx
        : (widget.childOffset.dx - maxMenuWidth + widget.childSize!.width);
    final topOffset = (widget.childOffset.dy +
                menuHeight +
                widget.childSize!.height) <
            size.height - widget.bottomOffsetHeight!
        ? widget.childOffset.dy + widget.childSize!.height + widget.menuOffset!
        : widget.childOffset.dy - menuHeight - widget.menuOffset!;

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (canPop, r) {
        widget.controller?.close();
        return;
      },
      child: CustomScaffold(
        body: (colors) =>  Stack(
          fit: StackFit.expand,
          children: <Widget>[
            GestureDetector(
                onTap: () {
                  _exit(context);
                },
                child: BackdropFilter(
                  filter: ImageFilter.blur(
                      sigmaX: widget.blurSize ?? 4,
                      sigmaY: widget.blurSize ?? 4),
                  child: Container(
                    color: (widget.blurBackgroundColor ?? Colors.black)
                        .withOpacity(0.7),
                  ),
                )),
            Positioned(
              top: topOffset,
              left: leftOffset,
              child: TweenAnimationBuilder(
                duration: const Duration(milliseconds: 200),
                builder: (BuildContext context, dynamic value, Widget? child) {
                  return Transform.scale(
                    scale: value,
                    alignment: Alignment.center,
                    child: child,
                  );
                },
                tween: Tween(begin: 0.0, end: 1.0),
                child: Container(
                  width: maxMenuWidth,
                  height: menuHeight + 6,
                  decoration: BoxDecoration(
                    color: AppStyle.transparent,
                    borderRadius: BorderRadius.circular(AppConstants.radius.r),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppConstants.radius.r),
                    child: FocusableActionDetector(
                      mouseCursor: SystemMouseCursors.click,
                      autofocus: true,
                      actions: {
                        ActivateIntent:
                            CallbackAction<Intent>(onInvoke: (intent) async {
                          _exit(context);
                          if (_indexSelected != -1) {
                            widget.menuItems[_indexSelected].onPressed?.call();
                          }
                          return intent;
                        }),
                        DirectionalFocusIntent:
                            CallbackAction<DirectionalFocusIntent>(
                                onInvoke: (intent) async {
                          switch (intent.direction) {
                            case TraversalDirection.up:
                            case TraversalDirection.left:
                              _getNextPosition(increment: false);
                              break;
                            case TraversalDirection.down:
                            case TraversalDirection.right:
                              _getNextPosition(increment: true);
                              break;
                          }

                          return intent;
                        }),
                      },
                      child: ScrollConfiguration(
                        behavior: ScrollConfiguration.of(context)
                            .copyWith(scrollbars: widget.enableMenuScroll),
                        child: Material(
                          type: MaterialType.transparency,
                          child: ListView.builder(
                            itemCount: widget.menuItems.length,
                            padding: EdgeInsets.zero,
                            physics: const NeverScrollableScrollPhysics(),
                            itemBuilder: (context, index) {
                              FocusedMenuItem item = widget.menuItems[index];
                              return Material(
                                color: item.backgroundColor,
                                child: GestureDetector(
                                  onTap: () {
                                    if (item.onPressed == null) return;
                                    _exit(context);
                                    item.onPressed?.call();
                                  },
                                  child: Container(
                                    decoration:
                                        _buildBoxDecoration(item, index),
                                    alignment: Alignment.center,
                                    margin: EdgeInsets.only(
                                        top: index == 0 ? 10.r : 0),
                                    height: widget.itemExtent ?? 50,
                                    child: Column(
                                      children: [
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 14),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: <Widget>[
                                              if (item.leadingIcon != null) ...[
                                                item.leadingIcon!
                                              ],
                                              item.title,
                                              if (item.trailingIcon !=
                                                  null) ...[item.trailingIcon!]
                                            ],
                                          ),
                                        ),
                                        if (index !=
                                            widget.menuItems.length - 1)
                                          Column(
                                            children: [
                                              4.verticalSpace,
                                              const Divider(
                                                color: AppStyle.bgGrey,
                                              )
                                            ],
                                          ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  BoxDecoration _buildBoxDecoration(FocusedMenuItem item, int index) {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(AppConstants.radius.r),
      color: item.backgroundColor ?? AppStyle.white,
    );
  }

  void _exit(BuildContext context) {
    widget.controller != null
        ? widget.controller?.dispose()
        : Navigator.pop(context);
  }
}

class FocusedMenuItem {
  Widget title;
  Color? backgroundColor;
  Icon? leadingIcon;
  Icon? trailingIcon;
  VoidCallback? onPressed;
  bool? isDefaultAction;

  FocusedMenuItem({
    required this.title,
    this.backgroundColor,
    this.leadingIcon,
    this.trailingIcon,
    this.onPressed,
    this.isDefaultAction = false,
  });
}
