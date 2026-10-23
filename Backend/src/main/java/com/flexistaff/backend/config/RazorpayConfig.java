package com.flexistaff.backend.config;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;

@Configuration
@Getter
@Slf4j
public class RazorpayConfig {

    @Value("${razorpay.key-id:rzp_test_placeholderKeyId}")
    private String keyId;

    @Value("${razorpay.key-secret:placeholderKeySecret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:placeholderWebhookSecret}")
    private String webhookSecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.company-name:FlexiStaff Technologies}")
    private String companyName;

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(15))
                .build();
    }

    public boolean isConfigured() {
        return keyId != null && !keyId.trim().isEmpty() && !keyId.contains("placeholder")
                && keySecret != null && !keySecret.trim().isEmpty() && !keySecret.contains("placeholder");
    }

    public boolean isWebhookConfigured() {
        return webhookSecret != null && !webhookSecret.trim().isEmpty() && !webhookSecret.contains("placeholder");
    }

    /**
     * Verifies payment signature: HMAC-SHA256(orderId + "|" + paymentId, keySecret)
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            return false;
        }
        try {
            String data = orderId + "|" + paymentId;
            String expected = calculateHmacSha256(data, keySecret);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception ex) {
            log.error("Error verifying Razorpay payment signature: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Verifies webhook payload signature against X-Razorpay-Signature
     */
    public boolean verifyWebhookSignature(String rawPayload, String signature) {
        if (rawPayload == null || signature == null || !isWebhookConfigured()) {
            return false;
        }
        try {
            String expected = calculateHmacSha256(rawPayload, webhookSecret);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception ex) {
            log.error("Error verifying Razorpay webhook signature: {}", ex.getMessage());
            return false;
        }
    }

    public static String calculateHmacSha256(String data, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKeySpec);
            byte[] hash = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256 signature", e);
        }
    }
}
