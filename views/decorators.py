
from functools import wraps
from flask import Flask, escape, request, session, redirect, url_for, jsonify, Blueprint
import jwt
import settings

decorators = Blueprint('decorators', __name__)


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        if 'x-access-tokens' in session.keys():
            token = session.get('x-access-tokens')
            try:
                data = jwt.decode(token, decorators.config["SECRET_KEY"])
                user_address = session.get("user_address")
                return f(user_address, *args, **kwargs)
            except Exception as e:
                print(e)
                return redirect("/")

        return redirect("/")
    return decorator