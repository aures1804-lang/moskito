ENFERMEDADES = {
    'dengue': {'fiebre_alta': 2, 'dolor_cabeza': 1, 'erupciones': 2, 'dolor_muscular': 2, 'nauseas': 1},
    'zika': {'fiebre_baja': 2, 'erupciones': 3, 'conjuntivitis': 2, 'dolor_articular': 1},
    'chikungunya': {'fiebre_alta': 1, 'dolor_articular': 3, 'erupciones': 1, 'fatiga': 2},
    'malaria': {'fiebre_ciclica': 3, 'escalofrios': 2, 'sudoracion': 2, 'fatiga': 1},
    'fiebre_amarilla': {'fiebre_alta': 2, 'ictericia': 3, 'dolor_abdominal': 2, 'vomitos': 2, 'sangrado': 3}
}
MAX_PUNTOS = {enf: sum(pesos.values()) for enf, pesos in ENFERMEDADES.items()}

def calcular_probabilidades(sintomas):
    probabilidades = {}
    for enf, pesos in ENFERMEDADES.items():
        puntos = sum(pesos.get(sint, 0) for sint in sintomas)
        prob = (puntos / MAX_PUNTOS[enf]) * 100 if MAX_PUNTOS[enf] > 0 else 0
        if prob > 0:
            probabilidades[enf] = round(prob, 2)
    return probabilidades
