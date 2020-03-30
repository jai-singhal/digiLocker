
from flask import Flask, escape, request, session, redirect, url_for, jsonify, Blueprint
from flask import render_template

import hashlib
import jwt
import random, os, string
import datetime
from flask_mail import Mail
import settings
from .decorators import token_required
from utils import *

auth = Blueprint('auth', __name__)
auth.config.from_object(settings)
mail = Mail(auth)

@auth.route("/registration")
@token_required
def registration(user_address):
    return render_template("registration.html", user_address = user_address)



@auth.route("/api/register/metamask", methods = ['POST'])
def registration_postapi():
    email = request.form.get("email")
    master_key = request.form.get("master_key")
    user_address = request.form.get("user_address")
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")

    pu, pr = generateRSAKeypair()
    msg = prepareMailMsg(f"{first_name} {last_name}", email, user_address, pu, pr, master_key)
    mail.send(msg)
    mkey_digest = hashlib.sha256(master_key.strip().encode()).hexdigest()

    if True:
        return {
            'success': True, 
            'redirect_url': "/dashboard",
            "master_key_hash": mkey_digest,
            'error': "Address verification done",
            "pu": pu.decode()
        }
    else:
        return {
            'success': False, 
            'redirect_url': "/",
            'error': "Address verification failed"
        }


@auth.route("/api/login/metamask", methods = ['GET'])
def login_api():
    urandomToken = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for i in range(32))
    token = jwt.encode({
        'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
        'token': urandomToken
        }, 
        auth.config['SECRET_KEY']
    ).decode("utf-8")
    session['x-access-tokens'] = token
    return jsonify({"data": token, })

@auth.route("/api/login/metamask", methods = ['POST'])
def login_postapi():
    token = session.get('x-access-tokens')
    if not token:
        return {'error': "No login token in session, please request token again by sending GET request to this url",
                'success': False}
    else:
        # session.pop("x-access-tokens", None)
        signature = request.form.get("signature")
        address = request.form.get("address")
        is_registered = request.form.get("newuser")
        session["user_address"] = address
        recovered_addr = recover_to_addr(token, signature)
        if address != recovered_addr:
            return {
                'success': False, 
                'redirect_url': "/",
                'error': "Address verification failed"
            }
        else:
            if is_registered == "false":
                return {'success': True, 'redirect_url': "/registration"}
            else:
                return {'success': True, 'redirect_url': "/dashboard"}




@auth.route("/api/logout/metamask", methods = ['GET'])
@token_required
def logout(user_address3):
    print("logout")
    session.pop("x-access-tokens", None)
    session.pop("user_address", None)
    return {'success': True, 'redirect_url': "/"}
