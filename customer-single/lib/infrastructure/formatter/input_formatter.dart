import 'package:flutter/services.dart';

class InputFormatterCurrency extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    String newText = newValue.text.replaceAll(' ', '');
    if (!_isValidDecimalInput(newText)) {
      return oldValue;
    }

    String formattedText = _formatWithThousandsSeparator(newText);
    return TextEditingValue(
      text: formattedText,
      selection: TextSelection.collapsed(offset: formattedText.length),
    );
  }

  bool _isValidDecimalInput(String value) {
    final regex = RegExp(r'^\d*\.?\d{0,4}$');
    return regex.hasMatch(value);
  }

  String _formatWithThousandsSeparator(String value) {
    if (value.isEmpty) return value;

    List<String> parts = value.split('.');
    String integerPart = parts[0];
    String decimalPart = parts.length > 1 ? '.${parts[1]}' : '';

    final buffer = StringBuffer();
    for (int i = 0; i < integerPart.length; i++) {
      if (i > 0 && (integerPart.length - i) % 3 == 0) {
        buffer.write(' ');
      }
      buffer.write(integerPart[i]);
    }
    return buffer.toString() + decimalPart;
  }
}
