# IMPORTACIONES NECESARIAS
from django.http import JsonResponse
from .models import coche, ImagenCoche # Importamos el modelo de imágenes
import json
from django.views.decorators.csrf import csrf_exempt


# --------------------------------------------------------------------------
# VISTA 1: LISTAR COCHES (GET)
# --------------------------------------------------------------------------
def lista_coches_web(request):
    """
    Devuelve TODOS los coches de la base de datos.
    """
    coches_lista = list(coche.objects.values('id', 'marca', 'color', 'precio'))
    return JsonResponse({'coches': coches_lista})

# --------------------------------------------------------------------------
# VISTA 2: CREAR COCHE (POST) - SOPORTA IMÁGENES
# --------------------------------------------------------------------------
@csrf_exempt
def crear_coche(request):
    """
    Crea un nuevo coche y sus imágenes asociadas desde FormData.
    """
    if request.method == 'POST':
        try:
            # Obtenemos los campos de texto desde request.POST (FormData)
            marca = request.POST.get('marca')
            color = request.POST.get('color')
            precio_raw = request.POST.get('precio')
            
            if not all([marca, color, precio_raw]):
                return JsonResponse({'error': 'Faltan campos requeridos'}, status=400)
                
            precio_final = float(precio_raw)
            
            # 1. Crear el coche
            nuevo = coche(marca=marca, color=color, precio=precio_final)
            nuevo.save()

            # 2. Procesar las imágenes subidas (request.FILES contiene los archivos)
            imagenes = request.FILES.getlist('imagenes')
                        # --- LOGS DE DIAGNÓSTICO ---
            print(f"--- DEBUG CREAR COCHE ---")
            print(f"Claves en request.FILES: {request.FILES.keys()}")
            print(f"Número de imágenes recibidas en getlist('imagenes'): {len(imagenes)}")
            for i, img in enumerate(imagenes):
                print(f"Imagen {i+1}: Nombre={img.name}, Tamaño={img.size}")
            print(f"-------------------------")
            # -----------------------------
            for imagen in imagenes:
                ImagenCoche.objects.create(coches=nuevo, imagen=imagen)

            return JsonResponse({
                'mensaje': 'Coche creado exitosamente',
                'coche': {
                    'id': nuevo.pk,
                    'marca': nuevo.marca,
                    'color': nuevo.color,
                    'precio': nuevo.precio
                }
            }, status=201)
        
        except ValueError:
            return JsonResponse({'error': 'Precio debe ser un número válido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
    return JsonResponse({'error': 'método no permitido'}, status=405)

# --------------------------------------------------------------------------
# VISTA 3: ELIMINAR COCHE (DELETE)
# --------------------------------------------------------------------------
@csrf_exempt
def eliminar_coche(request, coche_id):
    """
    Borra un coche específico y sus imágenes asociadas (gracias a on_delete=CASCADE).
    """
    if request.method == 'DELETE':
        try:
            coche_eliminar = coche.objects.get(pk=coche_id)
            coche_eliminar.delete()
            return JsonResponse({'mensaje': 'Coche eliminado exitosamente'}, status=200)
        except coche.DoesNotExist:
            return JsonResponse({'error': 'Coche no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# --------------------------------------------------------------------------
# VISTA 4: ACTUALIZAR COCHE (AHORA ACEPTA POST TAMBIÉN)
# --------------------------------------------------------------------------
@csrf_exempt
def actualizar_coche(request, coche_id):
    """
    Modifica un coche existente. Acepta POST para compatibilidad con FormData/Archivos.
    """
    # CAMBIO AQUÍ: Añadimos 'POST' a la lista de métodos permitidos
    if request.method in ['PUT', 'PATCH', 'POST']: 
        try:
            # --- LOGS DE DIAGNÓSTICO PARA VER SI LLEGAN LOS ARCHIVOS ---
            print(f"--- DEBUG ACTUALIZAR COCHE {coche_id} ---")
            print(f"Método recibido: {request.method}")
            print(f"Claves en request.POST: {list(request.POST.keys())}")
            print(f"Claves en request.FILES: {list(request.FILES.keys())}")
            
            nuevas_imagenes = request.FILES.getlist('imagenes')
            print(f"Número de imágenes nuevas recibidas: {len(nuevas_imagenes)}")
            for img in nuevas_imagenes:
                print(f" - Imagen nueva: {img.name} ({img.size} bytes)")
            print("---------------------------------")
            # ---------------------------------------------------------

            coche_a_editar = coche.objects.get(pk=coche_id)

            # 1. Actualizar campos de texto
            if 'marca' in request.POST:
                coche_a_editar.marca = request.POST['marca']
            if 'color' in request.POST:
                coche_a_editar.color = request.POST['color']
            if 'precio' in request.POST:
                coche_a_editar.precio = float(request.POST['precio'])

            coche_a_editar.save()

            # 2. Borrar imágenes marcadas
            ids_a_borrar = request.POST.getlist('imagenes_a_borrar')
            if ids_a_borrar:
                ImagenCoche.objects.filter(id__in=ids_a_borrar, coches=coche_a_editar).delete()

            # 3. Añadir nuevas imágenes
            # Ahora esto SÍ funcionará porque usamos POST y Django llena request.FILES
            for imagen in nuevas_imagenes:
                ImagenCoche.objects.create(coches=coche_a_editar, imagen=imagen)

            return JsonResponse({
                'mensaje': 'Coche actualizado exitosamente',
                'coche': {
                    'id': coche_a_editar.pk,
                    'marca': coche_a_editar.marca,
                    'color': coche_a_editar.color,
                    'precio': coche_a_editar.precio
                }
            }, status=200)

        except coche.DoesNotExist:
            return JsonResponse({'error': 'Coche no encontrado'}, status=404)
        except Exception as e:
            print(f"ERROR CRÍTICO EN ACTUALIZAR: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)
# --------------------------------------------------------------------------
# VISTA 5: DETALLE COCHE (GET) - DEVUELVE IMÁGENES CON ID
# --------------------------------------------------------------------------
def detalle_coche(request, coche_id):
    """
    Devuelve los datos de UN SOLO coche específico, incluyendo sus imágenes.
    IMPORTANTE: Devuelve el ID de cada imagen para permitir su borrado individual.
    """
    if request.method == 'GET':
        try:
            # Usamos prefetch_related para cargar las imágenes eficientemente
            coche_obj = coche.objects.prefetch_related('imagenes').get(pk=coche_id)
            
            imagenes_qs = coche_obj.imagenes.all()  # type: ignore[attr-defined]
            
            lista_imagenes = []
            for img in imagenes_qs:
                # AQUI EL CAMBIO: Devolvemos un diccionario con id y url
                lista_imagenes.append({
                    'id': img.id,
                    'url': request.build_absolute_uri(img.imagen.url)
                })

            return JsonResponse({
                'id': coche_obj.pk,
                'marca': coche_obj.marca,
                'color': coche_obj.color,
                'precio': float(coche_obj.precio),
                'imagenes': lista_imagenes # Ahora es una lista de objetos {id, url}
            })
            
        except coche.DoesNotExist:
            return JsonResponse({'error': 'Coche no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)