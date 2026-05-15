# coches/password_views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
import json
import secrets
import datetime

# Diccionario temporal para almacenar tokens (en producción usaría BD o Redis)
reset_tokens = {}

@csrf_exempt
def request_password_reset(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({'error': 'Email requerido'}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Por seguridad, no revelamos si el email existe o no
                return JsonResponse({'message': 'Si el email existe, se ha enviado un enlace.'}, status=200)

            # Generar token único
            token = secrets.token_urlsafe(32)
            reset_tokens[token] = {
                # Usamos getattr para evitar warning de Pylance sobre atributos dinámicos
                'user_id': getattr(user, 'id', None), 
                'expires': datetime.datetime.now() + datetime.timedelta(hours=1)
            }

            # Enviar correo
            reset_link = f"http://localhost:3000/reset-password/{token}"
            subject = "Recuperación de contraseña - Tienda de Coches"
            message = f"Hola {user.username},\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_link}\n\nEste enlace expira en 1 hora."
            
            # Asegúrate de tener configurado EMAIL_HOST_USER en settings.py
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

            return JsonResponse({'message': 'Enlace de recuperación enviado'}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def reset_password_confirm(request, token):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_password = data.get('new_password')

            if not new_password or len(new_password) < 8:
                return JsonResponse({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=400)

            if token not in reset_tokens:
                return JsonResponse({'error': 'Token inválido o expirado'}, status=400)

            token_data = reset_tokens[token]
            if datetime.datetime.now() > token_data['expires']:
                del reset_tokens[token]
                return JsonResponse({'error': 'Token expirado'}, status=400)

            user = User.objects.get(id=token_data['user_id'])
            user.set_password(new_password)
            user.save()

            # Eliminar token usado
            del reset_tokens[token]

            return JsonResponse({'message': 'Contraseña restablecida con éxito'}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)