from flask import Flask, escape, request, session, redirect, url_for, jsonify
from flask import render_template
from utils import recover_to_addr
import jwt
import random, os, string
import datetime
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = b'OCML3BRawWEUeaxcuKHLpw'

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        print(session.keys())
        if 'x-access-tokens' in session.keys():
            token = session.get('x-access-tokens')
        if not token:
            return {'message': 'a valid token is missing'}
        try:
            data = jwt.decode(token, app.config["SECRET_KEY"])
            user_address = session.get("user_address")
        except:
            return redirect("/")

        return f(user_address, *args, **kwargs)
    return decorator


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/dashboard")
@token_required
def dashboard(user_address):
    return render_template("dashboard.html", user_address = user_address)



@app.route("/api/login/metamask", methods = ['GET'])
def login_api():
    urandomToken = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for i in range(32))
    token = jwt.encode({
        'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=30),
        'token': urandomToken
        }, 
        app.config['SECRET_KEY']
    ).decode("utf-8")
    session['x-access-tokens'] = token
    return jsonify({"data": token, })

@app.route("/api/login/metamask", methods = ['POST'])
def login_postapi():
    token = session.get('x-access-tokens')
    if not token:
        return {'error': "No login token in session, please request token again by sending GET request to this url",
                'success': False}
    else:
        # session.pop("x-access-tokens", None)
        signature = request.form.get("signature")
        address = request.form.get("address")
        session["user_address"] = address
        recovered_addr = recover_to_addr(token, signature)
        if address != recovered_addr:
            return {
                'success': False, 
                'redirect_url': "/",
                'error': "Address verification failed"
            }
        else:
            return {'success': True, 'redirect_url': "/dashboard"}


@app.route("/api/logout/metamask", methods = ['GET'])
@token_required
def logout(user_address3):
    print("logout")
    session.pop("x-access-tokens", None)
    session.pop("user_address", None)
    return {'success': True, 'redirect_url': "/"}


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
    # app.run(host="172.18.16.108", debug=True)