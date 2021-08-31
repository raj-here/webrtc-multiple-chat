package test.socket.future;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

public class FutureSocketServer {

	public static void main(String[] args) throws IOException, InterruptedException, ExecutionException {
		AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open();
		InetSocketAddress hostAddress = new InetSocketAddress("localhost", 502);
		serverChannel.bind(hostAddress);

		System.out.println("Server channel bound to port: " + hostAddress.getPort());
		System.out.println("Waiting for client to connect... ");
		Future<AsynchronousSocketChannel> acceptResult = serverChannel.accept();
		AsynchronousSocketChannel clientChannel = acceptResult.get();

		System.out.println("Messages from client: ");

		if ((clientChannel != null) && (clientChannel.isOpen())) {

			while (true) {

				ByteBuffer buffer = ByteBuffer.allocate(1200);
				Future result = clientChannel.read(buffer);

				while (!result.isDone()) {
					// do nothing
				}

				buffer.flip();
				int limits = buffer.limit();
				byte bytes[] = new byte[limits];
				buffer.get(bytes, 0, limits);


				byte resp[] = new byte[255];
				byte plen = 0;

				if (bytes.length > 0) {
					if (bytes[7] == 3) {
						for (int i = 0; i <= 7; i++) {
							resp[i] = bytes[i];
						}
						plen = bytes[11];
						if (plen == 0) {
							plen = 1;
						} else if (plen > 32) {
							plen = 32;
						}
						resp[5] = (byte) (5 + 2 * (plen - 1));
						resp[8] = (byte) (2 * plen);
						for (int rlen = 0; rlen < plen - 1; rlen++) {
							if (bytes[9] >= 0 && bytes[9] <= 19) {
								resp[9] = 0;
								resp[10 + 2 * rlen] = 2; // (byte) Main.finalResult[bytes[9] + rlen];
							} else {
								resp[9] = 0;
								resp[10] = 19;
							}
						}

						ByteBuffer bbuf = ByteBuffer.allocate(9 + 2 * plen);
						System.out.println(bbuf.capacity());
						bbuf = bbuf.put(resp, 0, 9 + 2 * plen);

						bbuf.flip();

						Future<Integer> bytesWritten = clientChannel.write(bbuf);

						System.out.println("Data Sent:" + bytesWritten.get());

						buffer.clear();

					}
				} else {
					int a = 3;
					if (a == 4) {
						break;
					}
				}

				clientChannel.close();

			} // end-if

			serverChannel.close();
		}
	}
}
