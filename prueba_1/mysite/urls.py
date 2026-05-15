from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# Vistas de la aplicación de coches
from coches.views import (
    lista_coches_web, 
    crear_coche, 
    eliminar_coche, 
    actualizar_coche, 
    detalle_coche
)

# Vistas de autenticación (auth_views.py)
from coches.auth_views import (
    register_user, 
    login_user, 
    password_reset_request, 
    password_reset_confirm
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- API COCHES ---
    path('api/coches/', lista_coches_web, name='lista_coches_web'),  
    path('api/coches/<int:coche_id>/', detalle_coche, name='detalle_coche'),
    path('api/coches/crear/', crear_coche, name='crear_coche'),  
    path('api/coches/eliminar/<int:coche_id>/', eliminar_coche, name='eliminar_coche'), 
    path('api/coches/actualizar/<int:coche_id>/', actualizar_coche, name='actualizar_coche'), 

    # --- API AUTENTICACIÓN ---
    path('api/auth/register/', register_user, name='register'),
    path('api/auth/login/', login_user, name='login'),
    
    # Rutas de recuperación de contraseña (Cruciales las barras finales /)
    path('api/auth/password-reset/', password_reset_request, name='password_reset_request'),
    path('api/auth/password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
]

# Servir archivos multimedia (fotos de coches)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)