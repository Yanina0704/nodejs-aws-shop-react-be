import boto3

def write_item(item):

    dynamodb = boto3.client('dynamodb')

    dynamodb.put_item(
    TableName='products',
    Item={
        'id': {'S': item['id']},
        'title': {'S': item['title']},
        'price': {'N': item['price']},
        })

def write_items():
    item = {'id': '3', 'title': 'Pencil', 'price': '2' }
    write_item(item)

