from flask import Flask, escape, request, session, redirect, url_for
from flask import render_template
from utils import recover_to_addr

import random, os, string


app = Flask(__name__)
app.secret_key = b'OCML3BRawWEUeaxcuKHLpw'


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/login/metamask", methods = ['GET'])
def login_api():
    token = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for i in range(32))
    session['login_token'] = token
    return {"data": token, }

@app.route("/api/login/metamask", methods = ['POST'])
def login_postapi():
    token = session.get('login_token')
    if not token:
        return {'error': "No login token in session, please request token again by sending GET request to this url",
                'success': False}
    else:
        session.pop("login_token", None)
        signature = request.form.get("signature")
        address = request.form.get("address")
        recovered_addr = recover_to_addr(token, signature)
        print(recovered_addr, address)
        if address != recovered_addr:
            return {
                'success': False, 
                'redirect_url': "/",
                'error': "Address verification failed"
            }
        else:
            return {'success': True, 'redirect_url': "/"}


@app.route("/api/logout/metamask", methods = ['POST'])
def logout():
    session.pop("login_token", None)
    return {'success': True, 'redirect_url': "/"}


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
    # app.run(host="172.18.16.108", debug=True)