from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
from threading import Timer
import webbrowser

url = 'http://127.0.0.1:8766'
try:
    server = ThreadingHTTPServer(('127.0.0.1', 8766), partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).parent)))
except OSError:
    print('端口 8766 已被使用。如已启动游戏，请直接打开浏览器；否则先停止占用该端口的程序。')
    webbrowser.open(url)
else:
    Timer(0.5, lambda: webbrowser.open(url)).start()
    print('游戏已启动：' + url + '，按 Ctrl+C 关闭。')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
