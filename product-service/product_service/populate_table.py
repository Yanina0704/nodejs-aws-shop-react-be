import boto3
import uuid
import json

def write_item(item):

    dynamodb = boto3.client('dynamodb')
    product_id = str(uuid.uuid4())

    dynamodb.put_item(
       TableName='products',
       Item={
          'id': {'S': product_id},
          'title': {'S': item['title']},
          'description': {'S': item['description']},
          'price': {'N': str(item['price'])},
          })
    
    dynamodb.put_item(
        TableName='stocks',
        Item={
           'product_id': {'S': product_id},
           'count': {'N': str(item['count'])},
             })

def write_items():
    with open('data/products.json', 'r') as json_file:
        data = json.load(json_file)
    for item in data:
        write_item(item)

