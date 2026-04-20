import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/car.dart';
import '../providers/auth_provider.dart';
import '../providers/car_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = context.read<AuthProvider>().token!;
      context.read<CarProvider>().loadCars(token);
    });
  }

  void _bookCar(Car car) {
    Navigator.pushNamed(context, '/booking', arguments: car);
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('السيارات المتاحة'),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () {
                context.read<AuthProvider>().logout();
                Navigator.pushReplacementNamed(context, '/login');
              },
            ),
          ],
        ),
        body: Consumer<CarProvider>(
          builder: (_, provider, __) {
            if (provider.loading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (provider.error != null) {
              return Center(child: Text('خطأ: ${provider.error}'));
            }

            if (provider.cars.isEmpty) {
              return const Center(child: Text('لا توجد سيارات متاحة'));
            }

            return ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: provider.cars.length,
              itemBuilder: (_, index) {
                final car = provider.cars[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.directions_car),
                    title: Text('${car.make} ${car.model}'),
                    subtitle: Text('${car.plate} · ${car.seats} مقاعد'),
                    trailing: ElevatedButton(
                      onPressed: () => _bookCar(car),
                      child: const Text('احجز'),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
