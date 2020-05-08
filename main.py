from flask import Flask, escape, request, session, redirect, url_for, jsonify, flash
from flask import render_template
from utils import *
import jwt
import random, os, string
import datetime
from functools import wraps
import settings
import hashlib
from flask_mail import Mail
from werkzeug.utils import secure_filename
# from werkzeug import secure_filename
import dropbox


app = Flask(__name__)
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', "docx"])
app.config.from_object(settings)
mail = Mail(app)
dropbox_ = dropbox.Dropbox(app.config["DROPBOX_ACCESS_TOKEN"])


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        if 'x-access-tokens' in session.keys():
            token = session.get('x-access-tokens')
            try:
                data = jwt.decode(token, app.config["SECRET_KEY"])
                user_address = session.get("user_address")
                return f(user_address, *args, **kwargs)
            except Exception as e:
                return f(None, *args, **kwargs)

        return f(None, *args, **kwargs)

    return decorator

@app.route("/")
@token_required
def index(user_address):
    return render_template("index.html", user_address = user_address)

@app.route("/dashboard", methods=['GET'])
@token_required
def dashboard(user_address = None):
    if not user_address:
        return redirect("/")
    return render_template("dashboard.html", user_address = user_address)

@app.route("/registration")
@token_required
def registration(user_address):
    if not user_address:
        return redirect("/")
    return render_template("registration.html", user_address = user_address)


# def allowed_file(filename):
# 	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/dashboard/upload/doc', methods=['GET'])
@token_required
def upload_file(user_address):
    if not user_address:
        return redirect("/")
    return render_template("upload_doc.html", user_address=user_address)

@app.route('/post/api/upload/doc', methods=['POST'])
@token_required
def upload_file_postapi(user_address):
    if 'total_doc' not in request.form:
        return {"success": False, "error": "No files uploaded"}
    
    total_doc = request.form["total_doc"]
    file = request.files['file']

    if file.filename == '':
        return {"success": False, "error": "No selected file"}
    else:
        try:
            savepath = secure_filename(file.filename)
            savepath = f"/test_dropbox/{user_address}/{savepath}"
            res = dropbox_.files_upload(file.read(), savepath)
        except Exception as e:
            return {"success": False, "error": str(e)}
            print(e)
        return {"success": True, "redirect_url": "/dashboard"}


@app.route("/api/user/accesskey", methods = ['POST'])
@token_required
def comparehash_digest(user_address):
    try:
        master_key = request.form['master_key']
        mkeydigest = request.form['mkeydigest']
        total_doc = request.form['total_doc']
        mkey_digest_new = hashlib.sha256(master_key.strip().encode()).hexdigest()
        result = dict()
        if "0x" + mkey_digest_new == mkeydigest:
            result={"valid": True, 'success': True}
        else:
            result={"valid": False, 'success': True}   

        ekey = getKey(int(total_doc), master_key, user_address)
        result["ekey"] = ekey
        return jsonify(result)

    except Exception as e:
        print(e)
        return jsonify({'success': False})   


@app.route("/api/register/metamask", methods = ['POST'])
def registration_postapi():
    email = request.form.get("email")
    master_key = request.form.get("master_key")
    user_address = request.form.get("user_address")
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")

    pu, pr = generateRSAKeypair()
    MAIL_SENDER = app.config["MAIL_SENDER"]
    msg = prepareMailMsg(f"{first_name} {last_name}", email, user_address, pu, pr, master_key, MAIL_SENDER)
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


@app.route("/api/login/metamask", methods = ['GET'])
def login_api():
    urandomToken = ''.join(random.SystemRandom().choice(string.ascii_letters + string.digits) for i in range(32))
    token = jwt.encode({
            'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=120),
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




@app.route("/api/logout/metamask", methods = ['GET'])
@token_required
def logout(user_address3):
    print("logout")
    session.pop("x-access-tokens", None)
    session.pop("user_address", None)
    return {'success': True, 'redirect_url': "/"}


@app.route("/dashboard", methods = ['POST'])
@token_required
def dashboardPost(user_address3):
    uid = request.form.get("uid", None)
    docid = request.form.get("docid", None)
    print(uid, docid)
    if uid:
        return redirect(url_for('searchUser', uid=uid))
    elif docid:
        return redirect(url_for('searchDoc', docid=docid))


@app.route("/search/uid", methods = ["GET"])
@token_required
def searchUser(user_address):
    print(user_address)
    if not user_address or not request.args['uid']:
        return redirect("/")
    return render_template(
        "searchUser.html", 
        user_address = user_address,
        uid = request.args['uid']
    )


@app.route("/search/doc", methods = ["GET"])
@token_required
def searchDoc(user_address):
    print(user_address)
    if not user_address or not request.args['docid']:
        return redirect("/")
    return render_template(
        "searchDoc.html", 
        user_address = user_address,
        docid = request.args['docid']
    )

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
    # app.run(host="172.18.16.108", debug=True)

