from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

@api_view(['POST'])
def register_user(request):
    """ Registro de usuarios """
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if User.objects.filter(username=username).exists():
        return Response({"error": "El usuario ya existe"}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({"message": "Registro ok"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_user(request):
    """ Login de usuarios """
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        return Response({
            "message": "Login ok",
            "username": user.username,
            "is_staff": user.is_staff
        }, status=status.HTTP_200_OK)
    return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def password_reset_request(request):
    """ Genera el email de recuperación en consola """
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"http://localhost:3000/reset-password?uid={uid}&token={token}"
        send_mail(
            'Recuperar Contraseña',
            f'Enlace: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
    return Response({"message": "Enviado"}, status=status.HTTP_200_OK)

@api_view(['POST'])
def password_reset_confirm(request):
    """ Procesa el cambio de clave limpiando fallos de copia """
    # LIMPIEZA TOTAL: Quitamos '3D', '=', espacios internos y espacios en los extremos
    uidb64 = request.data.get('uid', '').replace('3D', '').replace('=', '').replace(' ', '').strip()
    token = request.data.get('token', '').replace('3D', '').replace('=', '').replace(' ', '').strip()
    new_password = request.data.get('new_password')

    print(f"--- INTENTO FINAL ---")
    print(f"UID: '{uidb64}'")
    print(f"Token: '{token}'")

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            print("✅ ¡LOGRADO! Contraseña cambiada.")
            return Response({"message": "Éxito"}, status=status.HTTP_200_OK)
        else:
            print("❌ Token inválido (posiblemente caducado o mal copiado)")
            return Response({"error": "Token inválido"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"❌ Error: {e}")
        return Response({"error": "Error de servidor"}, status=status.HTTP_400_BAD_REQUEST)