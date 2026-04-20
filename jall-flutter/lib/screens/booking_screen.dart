import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/car.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _pickupCtrl = TextEditingController();
  final _destCtrl = TextEditingController();
  DateTime? _selectedDate;
  bool _loading = false;
  String? _error;
  bool _success = false;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _submit(Car car, String token) async {
    if (_pickupCtrl.text.isEmpty ||
        _destCtrl.text.isEmpty ||
        _selectedDate == null) {
      setState(() => _error = 'يرجى ملء جميع الحقول');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await ApiService(token: token).createBooking(
        carId: car.id,
        pickupLocation: _pickupCtrl.text.trim(),
        destination: _destCtrl.text.trim(),
        rideDate: _selectedDate!.toIso8601String().split('T').first,
      );
      setState(() => _success = true);
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  void dispose() {
    _pickupCtrl.dispose();
    _destCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final car = ModalRoute.of(context)!.settings.arguments as Car;
    final token = context.read<AuthProvider>().token!;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: Text('حجز ${car.make} ${car.model}')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: _success
              ? Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.check_circle,
                      color: Colors.green,
                      size: 80,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'تم الحجز بنجاح!',
                      style: TextStyle(fontSize: 22),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('العودة'),
                    ),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextField(
                      controller: _pickupCtrl,
                      decoration: const InputDecoration(
                        labelText: 'نقطة الانطلاق',
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _destCtrl,
                      decoration: const InputDecoration(labelText: 'الوجهة'),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.calendar_today),
                      label: Text(
                        _selectedDate == null
                            ? 'اختر التاريخ'
                            : _selectedDate!.toIso8601String().split('T').first,
                      ),
                      onPressed: _pickDate,
                    ),
                    const SizedBox(height: 24),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          _error!,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ),
                    if (_loading)
                      const Center(child: CircularProgressIndicator())
                    else
                      ElevatedButton(
                        onPressed: () => _submit(car, token),
                        child: const Text('تأكيد الحجز'),
                      ),
                  ],
                ),
        ),
      ),
    );
  }
}
