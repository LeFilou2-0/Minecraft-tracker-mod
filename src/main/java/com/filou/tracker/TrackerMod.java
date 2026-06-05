package com.filou.tracker;

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.client.networking.v1.ClientPlayConnectionEvents;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;

public class TrackerMod implements ModInitializer {

    private static final String RENDER_URL = "https://minecraft-tracker-j4h3.onrender.com/api/update-stats";
    private Instant loginTime;
    private String currentServerAddress = "Solo / Local";
    private final HttpClient httpClient = HttpClient.newBuilder().build();

    @Override
    public void onInitialize() {
        System.out.println("[ModTracker] Initialisé et prêt à suivre les sessions !");

        ClientPlayConnectionEvents.JOIN.register((handler, sender, client) -> {
            this.loginTime = Instant.now();
            if (client.getCurrentServerEntry() != null) {
                this.currentServerAddress = client.getCurrentServerEntry().address;
            } else {
                this.currentServerAddress = "Solo / Local";
            }
        });

        ClientPlayConnectionEvents.DISCONNECT.register((handler, client) -> {
            if (this.loginTime == null) return;
            Instant logoutTime = Instant.now();
            long playTimeDelta = Duration.between(this.loginTime, logoutTime).toMinutes();
            String playerUUID = client.getSession().getUuidOrNull().toString().replace("-", "");
            sendStatsToBackend(playerUUID, this.currentServerAddress, playTimeDelta);
        });
    }

    private void sendStatsToBackend(String uuid, String serverIp, long playTimeDelta) {
        CompletableFuture.runAsync(() -> {
            try {
                String jsonBody = String.format(
                    "{\"uuid\":\"%s\",\"serverIp\":\"%s\",\"playTimeDelta\":%d}",
                    uuid, serverIp, playTimeDelta
                );
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(RENDER_URL))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                        .build();
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            } catch (Exception e) {
                System.out.println("[ModTracker] Échec : " + e.getMessage());
            }
        });
    }
}
