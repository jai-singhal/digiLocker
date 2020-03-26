from eth_utils import is_hex_address
from web3.auto import w3
from eth_account.messages import defunct_hash_message


def recover_to_addr(token, signature):
    msghash = defunct_hash_message(text=token)
    address = w3.eth.account.recoverHash(msghash, signature=signature)
    res = is_hex_address(address)
    return address


