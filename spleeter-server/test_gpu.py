import tensorflow as tf

print("TensorFlow version:", tf.__version__)
print("GPU Available:", tf.config.list_physical_devices('GPU'))
print("CUDA Available:", tf.test.is_built_with_cuda())
print("GPU Details:", tf.config.list_physical_devices('GPU'))

if tf.config.list_physical_devices('GPU'):
    with tf.device('/GPU:0'):
        a = tf.constant([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
        b = tf.constant([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])
        c = tf.matmul(a, b)
        print("GPU computation successful:", c)