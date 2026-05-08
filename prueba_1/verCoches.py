import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from coches.models import coche  # importo la clase coche
coches = coche.objects.all()  # obtengo todos los coches 
sumando = 1  # creo una variable sumando

print("Coches disponibles:")  # imprimo un mensaje
print("=============================")

for c in coches:  # recorro la lista de coches
    print(f"{c} Es el coche numero {sumando}")  # imprimo cada coche
    sumando += 1  # sumo 1 a la variable sumando