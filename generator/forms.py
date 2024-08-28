# generator/forms.py
from django import forms

class SchemaForm(forms.Form):
    schema = forms.CharField(widget=forms.Textarea)
    format = forms.ChoiceField(choices=[('json', 'JSON'), ('bson', 'BSON')], initial='json')
    num_samples = forms.IntegerField(initial=10)
