import json
import base64

def handler(event: dict, context) -> dict:
    '''API для генерации изображений - тестовый режим с placeholder изображениями'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body_str = event.get('body', '{}')
        if not body_str:
            body_str = '{}'
            
        body = json.loads(body_str)
        prompt = body.get('prompt', '')
        style = body.get('style', 'modern')
        input_image_base64 = body.get('inputImage')

        if not prompt:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Prompt is required'}),
                'isBase64Encoded': False
            }

        import time
        timestamp = int(time.time() * 1000)
        image_url = f"https://picsum.photos/seed/{timestamp}/1024/1024"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'imageUrl': image_url,
                'prompt': prompt,
                'style': style
            }),
            'isBase64Encoded': False
        }

    except json.JSONDecodeError as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Invalid JSON',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__
            }),
            'isBase64Encoded': False
        }