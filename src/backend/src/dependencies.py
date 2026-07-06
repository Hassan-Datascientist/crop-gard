import httpx
import tensorflow as tf
from fastapi import Request


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


def get_disease_model(request: Request) -> tf.keras.Model:
    return request.app.state.disease_model
