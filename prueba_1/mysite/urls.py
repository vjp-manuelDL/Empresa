"""
URL configuration for mysite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from coches.views import lista_coches_web  # importo la vista lista_coches_web
from coches.views import crear_coche  # importo las vistas
from coches.views import eliminar_coche # importo la vista eliminar coche
from coches.views import actualizar_coche
 # importo la vista actualizar coche



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/coches/', lista_coches_web, name='lista_coches_web'),  # añado la ruta para la vista lista_coches_web
    path('api/coches/crear/', crear_coche, name='crear_coche'),  # añado la ruta para la vista crear_coche
    path('api/coches/eliminar/<int:coche_id>/', eliminar_coche, name='eliminar_coche'), # añado la ruta para la vista eliminar coche
    path('api/coches/actualizar/<int:coche_id>/', actualizar_coche, name='actualizar_coche'), # añado la ruta para la vista actualizar coche
]
