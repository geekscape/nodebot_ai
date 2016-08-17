import os

import numpy as np
from numpy import newaxis
import tensorflow as tf

import tflearn
from tflearn.layers.core import input_data, fully_connected
from tflearn.layers.conv import conv_2d
from tflearn.layers.estimator import regression

import generate_data

learning_rate = 0.001
num_iterations = 1000

def build_model():
	init = tf.truncated_normal_initializer(stddev=1e-4)

	network = input_data(shape=[None, 128, 128, 1], name='input')
	network = conv_2d(network, nb_filter=2, filter_size=5, strides=2, activation='tanh', weights_init=init)
	network = fully_connected(network, 1, activation='tanh', weights_init=init)
	network = regression(network, optimizer='sgd', learning_rate=learning_rate,
						 loss='mean_square', name='target')

	model = tflearn.DNN(network, tensorboard_verbose=0, checkpoint_path='checkpoints/road_model1')
	return model


if __name__ == '__main__':
	input_size = 128
	minibatch_size = 16
	batch_size = 3200

	checkpoint_path = 'checkpoints'
	if not os.path.exists(checkpoint_path):
		os.makedirs(checkpoint_path)

	model = build_model()

	# Train
	for i in range(num_iterations):
		image_data, label_data = \
			generate_data.generate_batch(
				height=input_size,
				width=input_size,
				minibatch_size=batch_size)

		X = image_data
		Y = label_data[:,newaxis]

		model.fit({'input': X}, {'target': Y},
				   n_epoch=1,
				   batch_size=minibatch_size,
				   snapshot_epoch=True, show_metric=True, run_id='road_model1')
