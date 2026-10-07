package judgeServer.domain.challenge.instance.Proxy;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

// ctf 서버로 보내는 요청을 전달하는 Proxy
@Component
public class InstanceProxy {

    // 인스턴스 서버에 전달하지 않는 값
    private static final Set<String> HOP_BY_HOP = Set.of(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailer", "transfer-encoding", "upgrade",
            "host", "content-length", "expect");

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .followRedirects(HttpClient.Redirect.NEVER) // 리다이렉트는 브라우저가 처리하게 그대로 전달
            .build();

    
    public ResponseEntity<byte[]> forward(String host, int port, String path, String query,
                                          String method, HttpHeaders inHeaders, byte[] body) {
        
        // 쿼리가 있는지 없는지 확인
        String q = (query != null && !query.isEmpty()) ? "?" + query : "";
        // host, port, path + q로 url을 조합한다.
        URI uri = URI.create("http://" + host + ":" + port + "/" + path + q);
        // 해당 도메인으로 요청을 보내고 대기한다. 타임아웃 15초
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(15));

        //
        if (inHeaders != null) {
            inHeaders.forEach((name, values) -> {
                if (!HOP_BY_HOP.contains(name.toLowerCase(Locale.ROOT))) {
                    values.forEach(v -> builder.header(name, v));
                }
            });
        }

        // 요청에 전달할 값이 있는지 확인
        // 있다면 바이트 배열로 변환 후 전달
        if (body != null && body.length > 0) {
            builder.method(method, HttpRequest.BodyPublishers.ofByteArray(body));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }
    
        // 메소드 전달
        try {
            HttpResponse<byte[]> resp = client.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray());

            HttpHeaders outHeaders = new HttpHeaders();
            for (Map.Entry<String, List<String>> e : resp.headers().map().entrySet()) {
                if (HOP_BY_HOP.contains(e.getKey().toLowerCase(Locale.ROOT))) {
                    continue; // 컨테이너가 다시 계산/관리하는 헤더는 넘기지 않는다
                }
                for (String v : e.getValue()) {
                    outHeaders.add(e.getKey(), v); // Set-Cookie/Location 등 요청을 보낸 클라이언트에게 전달
                }
            }
            return new ResponseEntity<>(resp.body(), outHeaders, resp.statusCode());
        } catch (IOException e) {
            return ResponseEntity.status(502)
                    .body(("인스턴스에 연결할 수 없습니다: " + e.getMessage()).getBytes(StandardCharsets.UTF_8));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(502).body("프록시 중단됨".getBytes(StandardCharsets.UTF_8));
        }
    }
}
