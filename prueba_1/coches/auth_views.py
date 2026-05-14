# coches/auth_views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import json

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if not all([username, email, password]):
                return JsonResponse({'error': 'Faltan campos requeridos'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'El nombre de usuario ya existe'}, status=400)

            # Crear usuario normal (is_staff=False por defecto)
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
            
            return JsonResponse({
                'message': 'Usuario registrado con éxito',
                'username': user.username,
                'is_staff': user.is_staff # Devolvemos si es admin o no
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(username=username, password=password)
            
            if user is not None:
                return JsonResponse({
                    'message': 'Login exitoso',
                    'username': user.username,
                    'is_staff': user.is_staff # CLAVE: Devolvemos si es admin
                })
            else:
                return JsonResponse({'error': 'Credenciales inválidas'}, status=401)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Método no permitido'}, status=405)