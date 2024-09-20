import json

# Example JSON structure (you can replace this with reading a file or an API response)
schema = {
  "names": {"type": "string"},
  "phoneFax": {"type": "string"},
  "email": {"type": "string"},
  "date": {"type": "string", "format": "date"},
  "time": {"type": "string", "format": "time"},
  "company": {"type": "string"},
  "streetAddress": {"type": "string"},
  "city": {"type": "string"},
  "postalZip": {"type": "string"},
  "region": {"type": "string"},
  "country": {"type": "string"},
  "latitudeLongitude": {"type": "array", "items": {"type": "number"}},
  "fixedNumberOfWords": {"type": "integer"},
  "randomNumber": {"type": "integer"},
  "alphanumeric": {"type": "string"},
  "boolean": {"type": "boolean"},
  "autoIncrement": {"type": "integer"},
  "numberRange": {"type": "number"},
  "normalDistribution": {"type": "number"},
  "guid": {"type": "string"},
  "constant": {"type": "string"},
  "computed": {"type": "string"},
  "list": {"type": "array", "items": {"type": "string"}},
  "weightedList": {"type": "array", "items": {"type": "string"}},
  "colour": {"type": "string"},
  "url": {"type": "string", "format": "url"},
  "currency": {"type": "string"},
  "bankAccountNums": {"type": "string"},
  "creditCardPAN": {"type": "string"},
  "cvv": {"type": "integer"},
  "pin": {"type": "integer"},
  "track1": {"type": "string"},
  "track2": {"type": "string"},
  "chileanRUTNumber": {"type": "string"}
}

# Function to map through the JSON and print field names with types
def map_schema(schema):
    for field, attributes in schema.items():
        field_type = attributes.get("type", "unknown")
        field_format = attributes.get("format", "")
        if field_format:
            print(f"Field: {field}, Type: {field_type}, Format: {field_format}")
        else:
            print(f"Field: {field}, Type: {field_type}")

# Call the function to map the schema
map_schema(schema)
