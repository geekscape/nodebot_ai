import tensorflow as tf
import tflearn

import train
import generate_data

tf.reset_default_graph()
model = train.build_model()

model.load('checkpoints/road_model1-72')

input_size = 128
data_size = 1

image_data, label_data = \
    generate_data.generate_batch(
        height=input_size,
        width=input_size,
        minibatch_size=data_size)

pr = model.predict(image_data)

import matplotlib.pyplot as plt

print(pr[0])
plt.imshow(image_data[0,:,:,0], interpolation='nearest')
plt.colorbar()
plt.show()
