import tensorflow as tf

model = tf.keras.models.load_model("models/crop_disease_model.keras")
print(model.input_shape)  # confirm this matches your IMG_SIZE, e.g. (None, 224, 224, 3)
print(model.output_shape)  # confirm this is (None, 10) for your 10 classes
model.summary()
