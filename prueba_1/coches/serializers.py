# coches/serializers.py
from rest_framework import serializers
from .models import coche, ImagenCoche

class CocheSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = coche
        fields = ['id', 'marca', 'color', 'precio', 'main_image']

    def get_main_image(self, obj):
        # Usamos 'imagenes' porque es el related_name que pusiste en el modelo
        primera_foto = obj.imagenes.first()
        if primera_foto and primera_foto.imagen:
            return primera_foto.imagen.url  # Devuelve la ruta relativa
        return None