from django.http import JsonResponse
from .models import coche

def lista_coches_web(request):
    """API que devuelve todos los coches en formato JSON"""
    coches_lista = list(coche.objects.values('id', 'marca', 'color', 'precio'))
    return JsonResponse({'coches': coches_lista})