import 'package:flutter/foundation.dart';

import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;

  String? get token => _token;
  bool get isAuthenticated => _token != null;

  Future<void> login(String email, String password) async {
    _token = await const ApiService().login(email, password);
    notifyListeners();
  }

  void logout() {
    _token = null;
    notifyListeners();
  }
}
