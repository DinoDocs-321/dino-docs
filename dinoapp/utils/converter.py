import json
from bson import BSON

json_string = ""

with open("data.json", 'r', encoding='utf-8') as json_data:
    json_string = json_data.read()

try:
    # use json.loads() to validate the string and create JSON dict
    json_docs = json.loads(json_string)

    # loads() method returns a Python dict
    print ("json_docs TYPE:", type(json_docs))

    # return a list of all of the JSON document keys
    print ("MongoDB collections:", list(json_docs.keys()))

except ValueError as error:
    # quit the script if string is not a valid JSON
    print ("json.loads() ValueError for BSON object:", error)
    quit()

for key, val in json_docs.items():

    # iterate each JSON document in the list
    for i, doc in enumerate(json_docs[key]):
        # bytearray([source[, encoding[, errors]]])

        try:
            # print the original JSON document
            print ("\ndoc:", doc)

            # encode the document using the BSON library
            data = BSON.encode(doc)
            print ("BSON encoded data:", type(data))

            # print the result of the BSON encoding
            print ("data:", data)

            # decode the BSON document back to a Python dict object
            decode_doc = BSON.decode(data)
            print ("decode_doc:", type(decode_doc))

        except Exception as error:
            # catch any BSON encoding or decoding errors
            print ("enumerate() JSON documents ERROR:", error)