# dino-docs/dinoapp/utils/converter.py
import json
from bson import BSON

def json_to_bson(json_string):
    try:
        json_docs = json.loads(json_string)
        bson_docs = []
        for key, val in json_docs.items():
            for doc in json_docs[key]:
                bson_data = BSON.encode(doc)
                bson_docs.append(bson_data)
        return bson_docs
    except ValueError as error:
        raise ValueError(f"Invalid JSON: {error}")
    except Exception as error:
        raise Exception(f"Error encoding BSON: {error}")

def bson_to_json(bson_docs):
    try:
        json_docs = {}
        for bson_data in bson_docs:
            doc = BSON.decode(bson_data)
            json_docs.update(doc)
        return json.dumps(json_docs)
    except Exception as error:
        raise Exception(f"Error decoding BSON: {error}")
