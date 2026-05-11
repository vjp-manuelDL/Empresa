# IMPORTACIONES NECESARIAS
# JsonResponse: Para devolver respuestas en formato JSON al Frontend.
# coche: El modelo de base de datos que definimos en models.py.
# json: Para convertir el texto que recibimos del Frontend en diccionarios Python.
# csrf_exempt: Permite que peticiones externas (como tu Next.js en puerto 3000) 
#              accedan a Django sin ser bloqueadas por seguridad CSRF.
from django.http import JsonResponse
from .models import coche
import json
from django.views.decorators.csrf import csrf_exempt

# --------------------------------------------------------------------------
# VISTA 1: LISTAR COCHES (GET)
# --------------------------------------------------------------------------
def lista_coches_web(request):
    """
    Esta función devuelve TODOS los coches de la base de datos.
    Se usa cuando el usuario entra a la web y debe ver la lista inicial.
    """
    # 1. Obtenemos todos los objetos del modelo 'coche'.
    # 2. Usamos .values(...) para obtener solo los campos que nos interesan como diccionarios.
    # 3. list(...) convierte el resultado en una lista normal de Python.
    coches_lista = list(coche.objects.values('id', 'marca', 'color', 'precio'))
    
    # 4. Devolvemos la lista envuelta en un diccionario con la clave 'coches'.
    return JsonResponse({'coches': coches_lista})

# --------------------------------------------------------------------------
# VISTA 2: CREAR COCHE (POST)
# --------------------------------------------------------------------------
@csrf_exempt
def crear_coche(request):
    """
    Esta función recibe datos nuevos y guarda un coche en la base de datos.
    Solo acepta métodos POST (enviar datos).
    """
    if request.method == 'POST':
        try:
            # 1. Cargamos los datos crudos (raw) que vienen del body de la petición
            datos = json.loads(request.body)
            
            marca = datos.get('marca')
            color = datos.get('color')
            precio_raw = datos.get('precio')
            
            # 2. Validación básica: Si falta algún dato esencial, devolvemos error 400
            if not marca or not color or precio_raw is None:
                return JsonResponse({'error': 'Faltan campos requeridos'}, status=400)
                
            # 3. Convertimos el precio a número decimal (float)
            precio_final = float(precio_raw)
            
            # 4. Creamos la instancia del objeto coche en memoria
            nuevo = coche(marca=marca, color=color, precio=precio_final)
            
            # 5. Guardamos en la base de datos SQLite
            nuevo.save()

            # 6. Respondemos con éxito (Status 201 = Creado)
            # NOTA: Usamos .pk (Primary Key) en lugar de .id para evitar errores de análisis estático.
            return JsonResponse({
                'mensaje': 'Coche creado exitosamente',
                'coche': {
                    'id': nuevo.pk,       # Usamos pk porque es equivalente a id pero más seguro en Django
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
    Esta función borra un coche específico de la base de datos.
    Recibe el ID del coche a través de la URL (ej: /eliminar/5/).
    """
    if request.method == 'DELETE':
        try:
            # 1. Buscamos el coche en la base de datos por su ID
            coche_eliminar = coche.objects.get(pk=coche_id)
            
            # 2. Borramos el objeto
            coche_eliminar.delete()
            
            # 3. Respondemos éxito (Status 200)
            return JsonResponse({'mensaje': 'Coche eliminado exitosamente'}, status=200)
            
        except coche.DoesNotExist:
            # Si el ID no existe en la base de datos
            return JsonResponse({'error': 'Coche no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# --------------------------------------------------------------------------
# VISTA 4: ACTUALIZAR COCHE (PUT / PATCH)
# --------------------------------------------------------------------------
@csrf_exempt
def actualizar_coche(request, coche_id):
    """
    Esta función modifica un coche existente.
    Acepta PUT (actualización completa) o PATCH (actualización parcial).
    """
    if request.method in ['PUT', 'PATCH']:
        try:
            # 1. Cargamos los datos nuevos que envía el Frontend
            datos = json.loads(request.body)
            
            # 2. Buscamos el coche existente por su ID (pk)
            coche_a_editar = coche.objects.get(pk=coche_id)

            # 3. Actualizamos los campos SOLO si se enviaron en el JSON
            # IMPORTANTE: Verificamos 'marca' in datos (la clave del diccionario)
            if 'marca' in datos:
                coche_a_editar.marca = datos['marca']
            
            if 'color' in datos:
                coche_a_editar.color = datos['color']
            
            if 'precio' in datos:
                # Convertimos el precio a float antes de guardar
                coche_a_editar.precio = float(datos['precio'])

            # 4. Guardamos los cambios en la base de datos
            coche_a_editar.save()

            # 5. Respondemos con el objeto actualizado (Status 200)
            return JsonResponse({
                'mensaje': 'Coche actualizado exitosamente',
                'coche': {
                    'id': coche_a_editar.pk,       # Usamos pk en lugar de .id
                    'marca': coche_a_editar.marca,
                    'color': coche_a_editar.color,
                    'precio': coche_a_editar.precio
                }
            }, status=200)

        except coche.DoesNotExist:
            return JsonResponse({'error': 'Coche no encontrado'}, status=404)
        except ValueError:
            return JsonResponse({'error': 'Precio debe ser un número válido'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON malformado'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)