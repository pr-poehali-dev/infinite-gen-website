import json
import os
import base64
import requests
from typing import Optional

def handler(event: dict, context) -> dict:
    '''API для генерации изображений через бесплатный Nano Banano сервис с поддержкой загрузки изображений'''
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
        body = json.loads(event.get('body', '{}'))
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

        style_prompts = {
            'vintage': 'vintage retro style, old film photograph, warm tones, nostalgic',
            'modern': 'modern sleek style, high quality, professional photography',
            'watercolor': 'watercolor painting style, artistic, soft colors, painted texture',
            'cyberpunk': 'cyberpunk style, neon lights, futuristic, dark atmosphere',
            'minimalist': 'minimalist style, clean, simple, elegant composition'
        }

        full_prompt = f"{prompt}, {style_prompts.get(style, '')}"

        api_url = "https://ai.nano-banano.com/v1/images/generations"
        
        payload = {
            "model": "flux-realism",
            "prompt": full_prompt,
            "n": 1,
            "size": "1024x1024"
        }

        if input_image_base64:
            payload["image"] = input_image_base64
            payload["prompt"] = f"modify this image: {full_prompt}"

        response = requests.post(
            api_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )

        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'API error: {response.text}'
                }),
                'isBase64Encoded': False
            }

        result = response.json()
        
        if 'data' in result and len(result['data']) > 0:
            image_data = result['data'][0]
            image_url = image_data.get('url') or image_data.get('b64_json')
            
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
        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No image data in response'}),
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
