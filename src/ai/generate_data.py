import math
import numpy as np
import skimage
import skimage.draw

def create_road(height=128, width=128, offset=0.0):
  image = np.zeros((height, width), dtype=np.uint8)
  left_edge  = width / 3
  right_edge = width - left_edge

  if (math.fabs(offset) > left_edge):
    offset = math.copysign(left_edge, offset)

  rows, columns = skimage.draw.polygon(  \
    [0, height, height, 0],              \
    [left_edge + offset, left_edge, right_edge, right_edge + offset])
  image[rows, columns] = 1
  image = image[:, :, np.newaxis]
  return image


def random_road(height=128, width=128):
  offset = (np.random.rand() * 256 - 128) / 3
  image = create_road(height, width, offset)
  return image, offset


def normal_distribution(images):
  np.add(images, -.5, out=images)
  np.multiply(images, 4, out=images)


def generate_batch(height=128, width=128, minibatch_size=10):
  input_data = np.zeros([minibatch_size, height, width, 1], dtype=np.float32)
  label_data = np.zeros([minibatch_size], dtype=np.float32)

  for i in range(minibatch_size):
    image, offset = random_road(height, width)
    input_data[i, :, :, :] = image
    label_data[i] = offset / width

  normal_distribution(input_data)

  return input_data, label_data
