import os  # librerias que son necesarias
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()  #el propio visual te pone esto, es para configurar el entorno de django

from coches.models import coche   # importo la clase coche
sumando = 0  # creo una variable para sumar el total de coches

print("Coches disponibles:")  # imprimo un mensaje
print("escribe 'no' para salir")  # imprimo un mensaje
print("=============================")  


while True:  # creo un bucle infinito para mostrar los coches
    respuesta = input("Quieres añadir un coche? (si/no): ").strip().lower()  # pido si quiere o no
    if respuesta in ['no','n']:
        print("Has salido del programa")
        break  # termino el bucle

    elif respuesta in ['si','s']:
        print("Introduce los datos del coche:")
        marca = input("Marca: ").strip()  # pido la marca
        color = input("Color: ").strip()  # pido el color
        entrada_precio = input("Precio: ").strip()  # pido el precio y lo convierto a float

        try:
            precio = float(entrada_precio)  
        except ValueError:
            print("Precio no válido. Por favor, introduce un número.")
            continue  # vuelvo al inico 

        nuevo_coche = coche(marca=marca, color=color, precio=precio)  # creo un nuevo coche con los datos introducidos
        nuevo_coche.save()  # guardo el coche en la base de datos
        print("Coche añadido correctamente.")
        sumando +=1 # sumo 1 al total de coches

        print("El total de coches es: ", sumando)  # imprimo el total de coches