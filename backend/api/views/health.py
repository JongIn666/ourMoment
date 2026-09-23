from django.db import connection
from django.db.utils import OperationalError
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def health(_request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('select 1')
            cursor.fetchone()
    except OperationalError:
        return Response(
            {
                'status': 'error',
                'service': 'ourMoment backend',
                'database': 'unavailable',
            },
            status=503,
        )

    return Response(
        {
            'status': 'ok',
            'service': 'ourMoment backend',
            'database': 'postgresql',
        }
    )