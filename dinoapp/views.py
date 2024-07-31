from django.shortcuts import render, redirect, HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.views.generic import TemplateView
from .forms import LoginForm, RegisterForm


# Create your views here.

def home(request):
  return HttpResponse("Hello dinoapp")  

class HomePageView(TemplateView):
    template_name = "index.html"
    

class AboutPageView(TemplateView):
    template_name = "about.html"

def loginpage_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('http://localhost:3000')  # Replace 'home' with the URL name for your homepage
            else:
                messages.error(request, 'Invalid email or password.')
    else:
        form = LoginForm()
    return render(request, 'loginPage.html', {'form': form})


def signup_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('loginPage')
    else:
        form = RegisterForm()
    return render(request, 'signupPage.html', {"form": form})

def forgotpass_view(request):
    return render(request, 'forgotPass.html')