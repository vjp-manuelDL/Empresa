from django.db import models

class coche(models.Model):
    marca = models.CharField(max_length=100)
    color = models.CharField(max_length=100)
    precio = models.FloatField()

    def __str__(self):
        return self.marca + " " + self.color + " " + str(self.precio) + "€"