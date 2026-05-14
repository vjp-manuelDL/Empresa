from django.db import models
from django.http import JsonResponse

class coche(models.Model):
    marca = models.CharField(max_length=100)
    color = models.CharField(max_length=100)
    precio = models.FloatField()

    def __str__(self):
        return self.marca + " " + self.color + " " + str(self.precio) + "€"
    
# MODELO PARA LAS IMAGENES DE LOS COCHES
class ImagenCoche(models.Model):
    coches = models.ForeignKey(coche, related_name='imagenes' ,on_delete=models.CASCADE )
    imagen = models.ImageField(upload_to='imagenes_coches/') #ruta donde se guardaran las imagenes

    def __str__(self):
        return f"Imagen del coche: {self.coches.marca}"


