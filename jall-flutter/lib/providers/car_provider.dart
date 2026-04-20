import 'package:flutter/foundation.dart';

import '../models/car.dart';
import '../services/api_service.dart';

class CarProvider extends ChangeNotifier {
  List<Car> _cars = [];
  bool _loading = false;
  String? _error;

  List<Car> get cars => _cars;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadCars(String token) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _cars = await ApiService(token: token).fetchCars();
    } catch (error) {
      _error = error.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
