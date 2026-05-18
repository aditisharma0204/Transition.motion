#!/usr/bin/env python3
"""Dev HTTP server with no-cache headers.

Plain `python3 -m http.server` lets the browser cache JS/CSS forever, which
hides edits to any module imported by another module (the cache-buster query
on the entry script doesn't propagate). This server forces re-fetch every time.
Run with: python3 dev-server.py
"""
import http.server
import socketserver

PORT = 5175

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def address_string(self):
        # Prevent reverse DNS lookups which cause severe latency on macOS
        host, port = self.client_address[:2]
        return host

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), NoCacheHandler) as httpd:
        print(f'Serving (no cache) on http://localhost:{PORT}/')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
